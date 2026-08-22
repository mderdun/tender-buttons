import { describe, expect, it } from 'vitest';
import { normalise, PERCEPTUAL, ACTION, BANDS } from '../../scripts/build-data.mjs';
import { SCHEMES } from './senses';
import packed from './data/portraits.json';
import stats from './data/stats.json';
import { decodeCorpus, type PackedCorpus } from './corpus';
import { isWord } from './types';

const { sections } = decodeCorpus(packed as PackedCorpus);
const words = sections.flatMap((section) =>
	section.portraits.flatMap((portrait) =>
		[portrait.title, ...portrait.paragraphs].flat().filter(isWord)
	)
);

describe('normalise', () => {
	// The word list in data/ was built by deleting everything non-alphanumeric, so
	// the front end has to reduce tokens exactly the same way or the join misses.
	it('strips punctuation the same way the word list was built', () => {
		expect(normalise('MILDRED’S')).toBe('mildreds');
		expect(normalise('rose-wood')).toBe('rosewood');
		expect(normalise('(glass),')).toBe('glass');
		expect(normalise('Crème')).toBe('crème');
	});
});

describe('generated corpus', () => {
	it('covers the whole text', () => {
		expect(stats.portraits).toBe(110);
		expect(stats.tokens).toBe(14901);
	});

	// A regression here means the join broke: either the normaliser changed or the
	// word list did. Both are worth failing a build over.
	it('matches the expected share of tokens', () => {
		expect(stats.matched).toBe(6624);
		expect(stats.coverage).toBeGreaterThan(0.44);
	});

	it('leaves only known word types unmatched', () => {
		expect(stats.unmatchedTypes).toBe(109);
		const unmatched = stats.unmatched.map((u) => u.word);
		// Stein's coinages have no rating in any norm set and never will.
		expect(unmatched).toContain('excreate');
		expect(unmatched).toContain('knealer');
		// Everything frequent should be a function word, not a content word.
		expect(unmatched.slice(0, 10)).toEqual([
			'a',
			'is',
			'and',
			'the',
			'it',
			'there',
			'that',
			'in',
			'not',
			'no'
		]);
	});

	it('drops the defective rows in the source word list', () => {
		expect(stats.droppedRows.numeric).toEqual(['2', '3', '4']);
		expect(stats.droppedRows.duplicate).toEqual(['sack']);
		expect(stats.vocabulary).toBe(2502);
	});
});

describe('annotated words', () => {
	it('renders one span per matched token', () => {
		expect(words).toHaveLength(stats.matched);
	});

	it('only carries categories the interface can style', () => {
		const perceptual = new Set(PERCEPTUAL);
		const action = new Set(ACTION);
		for (const word of words) {
			expect(perceptual.has(word.p)).toBe(true);
			expect(action.has(word.a)).toBe(true);
		}
	});

	it('quantises intensity into the expected bands', () => {
		for (const word of words) {
			expect(word.pl).toBeGreaterThanOrEqual(0);
			expect(word.pl).toBeLessThan(BANDS);
			expect(word.al).toBeGreaterThanOrEqual(0);
			expect(word.al).toBeLessThan(BANDS);
		}
	});

	// Token-weighted quantiles, so no band should be close to empty; if one is,
	// the banding maths has drifted and the strength control stops meaning much.
	it('spreads tokens across every band', () => {
		const counts = new Array(BANDS).fill(0);
		for (const word of words) counts[word.pl] += 1;
		for (const count of counts) {
			expect(count).toBeGreaterThan(words.length / (BANDS * 3));
		}
	});
});

describe('legend', () => {
	// Every category present in the data needs an entry, or words render with the
	// fallback grey and no texture.
	it('names every category the data uses', () => {
		expect(SCHEMES.perceptual.categories.map((c) => c.id).sort()).toEqual([...PERCEPTUAL].sort());
		expect(SCHEMES.action.categories.map((c) => c.id).sort()).toEqual([...ACTION].sort());
	});

	it('accounts for every rated word in the corpus counts', () => {
		const perceptualTotal = Object.values(stats.perceptualCounts).reduce((a, b) => a + b, 0);
		const actionTotal = Object.values(stats.actionCounts).reduce((a, b) => a + b, 0);
		expect(perceptualTotal).toBe(stats.vocabulary);
		expect(actionTotal).toBe(stats.vocabulary);
	});
});
