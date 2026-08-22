import type { Corpus, Portrait, Section, Segment } from './types';

/**
 * Undoes the packing done by scripts/build-data.mjs.
 *
 * The corpus is written with its category names interned and its segments as
 * bare values rather than objects: a plain run of text is a string, an
 * annotated word is `[surface, perceptual, action, pBand, aBand]`. That is
 * worth doing because the page is prerendered — the text arrives once as HTML
 * and then again in the hydration bundle, so every byte here is paid twice.
 */

interface PackedPortrait {
	id: string;
	n: number;
	titleText: string;
	repeat: number;
	exclusivity: number;
	title: PackedSegment[];
	paragraphs: PackedSegment[][];
}

interface PackedSection {
	id: string;
	title: string;
	exclusivity: number;
	portraits: PackedPortrait[];
}

export interface PackedCorpus {
	categories: string[];
	sections: PackedSection[];
}

type PackedSegment = string | [string, number, number, number, number];

export function decodeCorpus(packed: PackedCorpus): Corpus {
	const { categories } = packed;

	const segments = (list: PackedSegment[]): Segment[] =>
		list.map((s) =>
			typeof s === 'string'
				? { t: s }
				: { w: s[0], p: categories[s[1]], a: categories[s[2]], pl: s[3], al: s[4] }
		);

	const sections: Section[] = packed.sections.map((section) => ({
		id: section.id,
		title: section.title,
		exclusivity: section.exclusivity,
		portraits: section.portraits.map((portrait): Portrait => ({
			id: portrait.id,
			n: portrait.n,
			titleText: portrait.titleText,
			repeat: portrait.repeat,
			exclusivity: portrait.exclusivity,
			title: segments(portrait.title),
			paragraphs: portrait.paragraphs.map(segments)
		}))
	}));

	return { sections };
}
