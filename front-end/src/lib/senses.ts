/**
 * The two dominance schemes the reader can switch between.
 *
 * Category order is the order the legend lists them, which is by how much of the
 * text each one accounts for — so the legend doubles as a rough distribution.
 * Colours live in app.css as custom properties; only the identifiers are here,
 * because the whole appearance of a mark is resolved in CSS from these values.
 */

export type SchemeId = 'perceptual' | 'action';

export interface Category {
	id: string;
	label: string;
	/** Plain-language gloss, shown in the legend and the word inspector. */
	gloss: string;
}

export interface Scheme {
	id: SchemeId;
	label: string;
	description: string;
	categories: Category[];
}

export const SCHEMES: Record<SchemeId, Scheme> = {
	perceptual: {
		id: 'perceptual',
		label: 'Senses',
		description: 'Which of the six senses a word draws on most strongly.',
		categories: [
			{ id: 'visual', label: 'Sight', gloss: 'seen' },
			{ id: 'interoceptive', label: 'Interoception', gloss: 'felt from within' },
			{ id: 'auditory', label: 'Sound', gloss: 'heard' },
			{ id: 'gustatory', label: 'Taste', gloss: 'tasted' },
			{ id: 'haptic', label: 'Touch', gloss: 'touched' },
			{ id: 'olfactory', label: 'Smell', gloss: 'smelled' }
		]
	},
	action: {
		id: 'action',
		label: 'Body',
		description: 'Which part of the body a word most strongly implies acting with.',
		categories: [
			{ id: 'hand_arm', label: 'Hand & arm', gloss: 'handled' },
			{ id: 'head', label: 'Head', gloss: 'done with the head' },
			{ id: 'mouth', label: 'Mouth', gloss: 'spoken, eaten' },
			{ id: 'torso', label: 'Torso', gloss: 'done with the trunk' },
			{ id: 'foot_leg', label: 'Foot & leg', gloss: 'walked, kicked' }
		]
	}
};

export const SCHEME_LIST: Scheme[] = [SCHEMES.perceptual, SCHEMES.action];

/** All eleven raw dimensions, in the order the inspector charts them. */
export const DIMENSION_LABELS: Record<string, string> = {
	visual: 'Sight',
	auditory: 'Sound',
	haptic: 'Touch',
	gustatory: 'Taste',
	olfactory: 'Smell',
	interoceptive: 'Interoception',
	hand_arm: 'Hand & arm',
	head: 'Head',
	mouth: 'Mouth',
	torso: 'Torso',
	foot_leg: 'Foot & leg'
};

/** The highest rating the Lancaster norms use, so bars can be scaled against it. */
export const MAX_RATING = 5;
