import type { WordNorms } from './types';

/**
 * The full norm table is only needed once someone asks about a specific word, so
 * it is kept out of the initial bundle and imported on the first lookup.
 */

interface PackedNorms {
	categories: string[];
	dimensions: string[];
	words: Record<string, number[]>;
}

let loading: Promise<Map<string, WordNorms>> | null = null;

/** Undoes the columnar integer packing done by scripts/build-data.mjs. */
function decode(packed: PackedNorms): Map<string, WordNorms> {
	const { categories, dimensions, words } = packed;
	const table = new Map<string, WordNorms>();

	for (const [word, row] of Object.entries(words)) {
		const means: Record<string, number> = {};
		dimensions.forEach((name, i) => {
			means[name] = row[6 + i] / 1000;
		});
		table.set(word, {
			perceptual: categories[row[0]],
			perceptualExclusivity: row[1] / 1000,
			action: categories[row[2]],
			actionExclusivity: row[3] / 1000,
			sensorimotor: categories[row[4]],
			sensorimotorExclusivity: row[5] / 1000,
			means
		});
	}

	return table;
}

/** Reduces a surface word to its lookup key. Mirrors normalise() in the build script. */
export function normalise(token: string): string {
	return token
		.toLowerCase()
		.normalize('NFC')
		.replace(/[‘’‛]/g, "'")
		.replace(/[^\p{L}\p{N}]/gu, '');
}

export function loadNorms(): Promise<Map<string, WordNorms>> {
	loading ??= import('./data/norms.json').then((module) => decode(module.default as PackedNorms));
	return loading;
}
