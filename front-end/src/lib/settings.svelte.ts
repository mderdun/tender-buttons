import { browser } from '$app/environment';
import { SvelteSet } from 'svelte/reactivity';
import { SCHEMES, type SchemeId } from './senses';

/**
 * Reader settings, shared across the whole page.
 *
 * None of these cause the text to re-render. They end up as attributes and
 * custom properties on the reader element, and the browser resolves every
 * annotation from CSS — which is why switching scheme or hiding a category is
 * instant across 6,600 marked words.
 */

const STORAGE_KEY = 'tender-buttons:settings';

interface Stored {
	annotations?: boolean;
	scheme?: SchemeId;
	hidden?: Record<string, string[]>;
}

function restore(): Stored {
	if (!browser) return {};
	try {
		return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Stored;
	} catch {
		return {};
	}
}

const saved = restore();

class Settings {
	annotations = $state(saved.annotations ?? true);
	scheme = $state<SchemeId>(saved.scheme === 'action' ? 'action' : 'perceptual');
	/** Categories the reader has switched off, keyed by scheme. */
	hidden: Record<SchemeId, SvelteSet<string>> = {
		perceptual: new SvelteSet(saved.hidden?.perceptual ?? []),
		action: new SvelteSet(saved.hidden?.action ?? [])
	};

	/** Class list that drives which categories CSS suppresses. */
	get hiddenClasses(): string {
		return [...this.hidden[this.scheme]].map((id) => `off-${id}`).join(' ');
	}

	get soloed(): string | null {
		const scheme = SCHEMES[this.scheme];
		const shown = scheme.categories.filter((c) => !this.hidden[this.scheme].has(c.id));
		return shown.length === 1 ? shown[0].id : null;
	}

	toggle(categoryId: string) {
		const current = this.hidden[this.scheme];
		if (current.has(categoryId)) current.delete(categoryId);
		else current.add(categoryId);
	}

	/** Show only this category, or show everything again if it is already alone. */
	solo(categoryId: string) {
		const current = this.hidden[this.scheme];
		const alreadyAlone = this.soloed === categoryId;
		current.clear();
		if (alreadyAlone) return;
		for (const category of SCHEMES[this.scheme].categories) {
			if (category.id !== categoryId) current.add(category.id);
		}
	}

	showAll() {
		this.hidden[this.scheme].clear();
	}

	persist() {
		if (!browser) return;
		const payload: Stored = {
			annotations: this.annotations,
			scheme: this.scheme,
			hidden: {
				perceptual: [...this.hidden.perceptual],
				action: [...this.hidden.action]
			}
		};
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
		} catch {
			// Private browsing and full quotas both land here; settings are a
			// convenience, so losing them is not worth surfacing.
		}
	}
}

export const settings = new Settings();
