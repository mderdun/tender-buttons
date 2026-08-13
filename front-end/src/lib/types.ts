/** Shapes emitted by scripts/build-data.mjs. */

/** A run of text carrying no annotation — punctuation, spacing, stopwords. */
export interface PlainSegment {
	t: string;
}

/** A word that matched the norms, with its dominance and intensity band per scheme. */
export interface WordSegment {
	/** Surface form, exactly as it appears in the text. */
	w: string;
	/** Dominant perceptual category. */
	p: string;
	/** Dominant action category. */
	a: string;
	/** Perceptual exclusivity band, 0 (least exclusive) to 4. */
	pl: number;
	/** Action exclusivity band, 0 to 4. */
	al: number;
}

export type Segment = PlainSegment | WordSegment;

export function isWord(segment: Segment): segment is WordSegment {
	return 'w' in segment;
}

export interface Portrait {
	id: string;
	n: number;
	titleText: string;
	/** 0 unless the title repeats, in which case its ordinal within the repeats. */
	repeat: number;
	title: Segment[];
	paragraphs: Segment[][];
}

export interface Section {
	id: string;
	title: string;
	portraits: Portrait[];
}

export interface Corpus {
	sections: Section[];
}

/** The full norm record for one word, as decoded from norms.json. */
export interface WordNorms {
	perceptual: string;
	perceptualExclusivity: number;
	action: string;
	actionExclusivity: number;
	sensorimotor: string;
	sensorimotorExclusivity: number;
	means: Record<string, number>;
}
