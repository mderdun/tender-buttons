/**
 * Build-time annotation pipeline.
 *
 * Reads the two sources of truth in ../data and emits the JSON the site renders:
 *
 *   portraits.json  the full text, tokenised, with each word already joined to
 *                   its dominant sensorimotor category. The site renders this
 *                   directly, so no matching happens in the browser.
 *   norms.json      the full per-word norm table, loaded on demand by the word
 *                   inspector only.
 *   stats.json      corpus-level counts, also used by the coverage test.
 *
 * Run with `npm run data`. The outputs are committed so a build never depends on
 * the sibling data/ directory being present; CI re-runs this and fails on drift.
 */

import { csvParse } from 'd3-dsv';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(here, '../../data');
const OUT_DIR = resolve(here, '../src/lib/data');

/** The six perceptual categories, in the order the legend shows them. */
export const PERCEPTUAL = [
	'visual',
	'auditory',
	'haptic',
	'gustatory',
	'olfactory',
	'interoceptive'
];

/** The five action categories. */
export const ACTION = ['hand_arm', 'mouth', 'head', 'foot_leg', 'torso'];

/** The eleven raw dimensions, for the word inspector. */
const DIMENSIONS = [
	['Auditory.mean', 'auditory'],
	['Gustatory.mean', 'gustatory'],
	['Haptic.mean', 'haptic'],
	['Interoceptive.mean', 'interoceptive'],
	['Olfactory.mean', 'olfactory'],
	['Visual.mean', 'visual'],
	['Foot_leg.mean', 'foot_leg'],
	['Hand_arm.mean', 'hand_arm'],
	['Head.mean', 'head'],
	['Mouth.mean', 'mouth'],
	['Torso.mean', 'torso']
];

/** @type {Record<string, string>} */
const SECTION_TITLES = { objects: 'Objects', food: 'Food', rooms: 'Rooms' };

/**
 * Reduce a surface token to the key used in the word list.
 *
 * The word list was built in data/parser.ipynb by lowercasing and deleting
 * everything matching `[^\w\s]`, so "MILDRED'S" became "mildreds" and
 * "rose-wood" became "rosewood". Mirroring that exactly is what makes the join
 * land; the previous front-end stripped only edge punctuation and silently lost
 * every one of these.
 *
 * @param {string} token
 * @returns {string}
 */
export function normalise(token) {
	return token
		.toLowerCase()
		.normalize('NFC')
		.replace(/[‘’‛]/g, "'")
		.replace(/[^\p{L}\p{N}]/gu, '');
}

/** Matches a displayable word, including internal apostrophes and hyphens. */
const WORD_RE = /[\p{L}\p{N}]+(?:[''‘’-][\p{L}\p{N}]+)*/gu;

/**
 * @param {number} value
 * @returns {number} rounded to 3dp, which is the precision the source data has
 */
const round3 = (value) => Math.round(value * 1000) / 1000;

/**
 * Build the word -> norms lookup, cleaning the two known defects in the source:
 * bare numerals that survived tokenisation, and a duplicated `sack` row.
 *
 * @param {Record<string, string>[]} rows
 */
function buildNorms(rows) {
	/** @type {Map<string, any>} */
	const norms = new Map();
	/** @type {{ numeric: string[], duplicate: string[] }} */
	const dropped = { numeric: [], duplicate: [] };

	for (const row of rows) {
		const key = normalise(row.word ?? '');
		if (!key) continue;

		if (/^\d+$/.test(key)) {
			dropped.numeric.push(key);
			continue;
		}
		if (norms.has(key)) {
			dropped.duplicate.push(key);
			continue;
		}

		/** @type {Record<string, number>} */
		const means = {};
		for (const [column, name] of DIMENSIONS) {
			means[name] = round3(Number.parseFloat(row[column]) || 0);
		}

		norms.set(key, {
			perceptual: row['Dominant.perceptual'],
			perceptualExclusivity: round3(Number.parseFloat(row['Exclusivity.perceptual']) || 0),
			action: row['Dominant.action'],
			actionExclusivity: round3(Number.parseFloat(row['Exclusivity.action']) || 0),
			sensorimotor: row['Dominant.sensorimotor'],
			sensorimotorExclusivity: round3(Number.parseFloat(row['Exclusivity.sensorimotor']) || 0),
			means
		});
	}

	return { norms, dropped };
}

/** Number of intensity bands exclusivity is quantised into. */
export const BANDS = 5;

/**
 * Split a run of text into alternating plain segments and annotated words.
 *
 * Plain text is emitted as `{ t }`; an annotated word as `{ w, p, pe, a, ae }`,
 * carrying both dominance schemes so the reader can switch between them without
 * the page re-rendering. Unmatched words stay in the plain runs, so they render
 * as ordinary text with no wrapper element.
 *
 * The `pe`/`ae` floats are replaced by band indices in a later pass — see
 * bandify() — so the rendered HTML carries a small integer rather than a
 * six-character decimal on every one of the 6,600 annotated words.
 *
 * @param {string} text
 * @param {Map<string, any>} norms
 * @param {{ total: number, matched: number, unmatched: Map<string, number> }} tally
 */
function segment(text, norms, tally) {
	/** @type {Array<{ t: string } | { w: string, p: string, pe: number, a: string, ae: number }>} */
	const segments = [];
	let cursor = 0;
	let plain = '';

	for (const match of text.matchAll(WORD_RE)) {
		const surface = match[0];
		const start = match.index ?? 0;
		const entry = norms.get(normalise(surface));

		tally.total += 1;
		if (!entry) {
			const key = normalise(surface);
			tally.unmatched.set(key, (tally.unmatched.get(key) ?? 0) + 1);
			continue;
		}
		tally.matched += 1;

		plain += text.slice(cursor, start);
		if (plain) segments.push({ t: plain });
		plain = '';

		segments.push({
			w: surface,
			p: entry.perceptual,
			pe: entry.perceptualExclusivity,
			a: entry.action,
			ae: entry.actionExclusivity
		});
		cursor = start + surface.length;
	}

	plain += text.slice(cursor);
	if (plain) segments.push({ t: plain });
	return segments;
}

/**
 * Quantise exclusivity into BANDS levels using token-weighted quantiles, so each
 * band carries roughly the same share of the words a reader actually sees. Even
 * spacing on the raw range would put almost everything in one band: exclusivity
 * is tightly clustered.
 *
 * @param {any[]} allSegments every segment array in the corpus
 */
function bandify(allSegments) {
	/** @param {'pe' | 'ae'} key */
	const thresholdsFor = (key) => {
		/** @type {number[]} */
		const values = [];
		for (const segments of allSegments) {
			for (const s of segments) if (s.w !== undefined) values.push(s[key]);
		}
		values.sort((a, b) => a - b);
		return Array.from(
			{ length: BANDS - 1 },
			(_, i) => values[Math.floor((values.length * (i + 1)) / BANDS)]
		);
	};

	/** @param {number} value @param {number[]} thresholds */
	const band = (value, thresholds) => {
		let i = 0;
		while (i < thresholds.length && value >= thresholds[i]) i += 1;
		return i;
	};

	const perceptual = thresholdsFor('pe');
	const action = thresholdsFor('ae');

	for (const segments of allSegments) {
		for (const s of segments) {
			if (s.w === undefined) continue;
			s.pl = band(s.pe, perceptual);
			s.al = band(s.ae, action);
			delete s.pe;
			delete s.ae;
		}
	}

	return {
		perceptual: perceptual.map(round3),
		action: action.map(round3)
	};
}

/**
 * Splits a portrait into paragraphs on blank lines, unwrapping hard line breaks.
 *
 * @param {string} portrait
 * @returns {string[]}
 */
function paragraphsOf(portrait) {
	return portrait
		.split(/\n\s*\n+/)
		.map((paragraph) => paragraph.replace(/\s*\n\s*/g, ' ').trim())
		.filter((paragraph) => /\p{L}/u.test(paragraph));
}

function main() {
	const listRows = csvParse(readFileSync(resolve(DATA_DIR, 'list.csv'), 'utf-8'));
	const normRows = csvParse(readFileSync(resolve(DATA_DIR, 'words_with_sm_norms.csv'), 'utf-8'));

	const { norms, dropped } = buildNorms(normRows);
	const tally = { total: 0, matched: 0, unmatched: new Map() };

	/** @type {Map<string, any>} */
	const sections = new Map();
	/** @type {Record<string, number>} */
	const perceptualCounts = {};
	/** @type {Record<string, number>} */
	const actionCounts = {};

	/** @type {any[]} */
	const allSegments = [];
	/** @param {string} text */
	const segmented = (text) => {
		const segments = segment(text, norms, tally);
		allSegments.push(segments);
		return segments;
	};

	listRows.forEach((row, index) => {
		const category = row.category;
		if (!sections.has(category)) {
			sections.set(category, {
				id: category,
				title: SECTION_TITLES[category] ?? category,
				portraits: []
			});
		}

		// parser.ipynb disambiguates repeated titles with a " [2]" suffix. Keep the
		// clean title for display and carry the ordinal separately.
		const rawTitle = row.title.trim();
		const repeatMatch = rawTitle.match(/^(.*?)\s*\[(\d+)\]$/);
		const title = repeatMatch ? repeatMatch[1] : rawTitle;
		const repeat = repeatMatch ? Number.parseInt(repeatMatch[2], 10) : 0;

		sections.get(category).portraits.push({
			id: `p${index + 1}`,
			n: index + 1,
			titleText: title,
			repeat,
			title: segmented(title),
			paragraphs: paragraphsOf(row.portrait).map(segmented)
		});
	});

	const bands = bandify(allSegments);

	for (const entry of norms.values()) {
		perceptualCounts[entry.perceptual] = (perceptualCounts[entry.perceptual] ?? 0) + 1;
		actionCounts[entry.action] = (actionCounts[entry.action] ?? 0) + 1;
	}

	const unmatched = [...tally.unmatched.entries()]
		.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
		.map(([word, count]) => ({ word, count }));

	const stats = {
		portraits: listRows.length,
		sections: [...sections.values()].map((s) => ({
			id: s.id,
			title: s.title,
			portraits: s.portraits.length
		})),
		tokens: tally.total,
		matched: tally.matched,
		coverage: round3(tally.matched / tally.total),
		vocabulary: norms.size,
		bands,
		perceptualCounts,
		actionCounts,
		droppedRows: dropped,
		unmatchedTypes: unmatched.length,
		unmatched
	};

	// norms.json is fetched on the first word click, so it is stored columnar:
	// category names are interned and every number is scaled to a thousandth and
	// stored as an integer. That roughly halves the transfer for no real cost —
	// see decodeNorms() in src/lib/norms.js for the ten lines that undo it.
	/** @type {string[]} */
	const categories = [];
	/** @param {string} name */
	const intern = (name) => {
		const index = categories.indexOf(name);
		return index === -1 ? categories.push(name) - 1 : index;
	};
	/** @param {number} value */
	const scale = (value) => Math.round(value * 1000);
	/** @type {Record<string, number[]>} */
	const packed = {};
	for (const [word, entry] of norms) {
		packed[word] = [
			intern(entry.perceptual),
			scale(entry.perceptualExclusivity),
			intern(entry.action),
			scale(entry.actionExclusivity),
			intern(entry.sensorimotor),
			scale(entry.sensorimotorExclusivity),
			...DIMENSIONS.map(([, name]) => scale(entry.means[name]))
		];
	}

	mkdirSync(OUT_DIR, { recursive: true });
	writeFileSync(
		resolve(OUT_DIR, 'portraits.json'),
		JSON.stringify({ sections: [...sections.values()] })
	);
	writeFileSync(
		resolve(OUT_DIR, 'norms.json'),
		JSON.stringify({
			categories,
			dimensions: DIMENSIONS.map(([, name]) => name),
			words: packed
		})
	);
	writeFileSync(resolve(OUT_DIR, 'stats.json'), JSON.stringify(stats, null, '\t'));

	console.log(
		`${stats.portraits} portraits, ${stats.tokens} tokens, ` +
			`${stats.matched} matched (${(stats.coverage * 100).toFixed(1)}%), ` +
			`${stats.vocabulary} words in vocabulary`
	);
	if (dropped.numeric.length || dropped.duplicate.length) {
		console.log(
			`dropped from word list: numerals [${dropped.numeric.join(', ')}], ` +
				`duplicates [${dropped.duplicate.join(', ')}]`
		);
	}
}

// Guarded so the tests can import normalise() and the category lists without
// regenerating the data as a side effect.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	main();
}
