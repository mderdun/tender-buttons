<script lang="ts">
	import Portrait from './Portrait.svelte';
	import { settings } from '$lib/settings.svelte';
	import { normalise } from '$lib/norms';
	import type { Section } from '$lib/types';

	let {
		sections,
		selected,
		onselect
	}: {
		sections: Section[];
		selected: string | null;
		onselect: (word: string) => void;
	} = $props();

	let root = $state<HTMLDivElement | null>(null);

	/**
	 * Words are not individually focusable: there are 6,624 of them, and putting
	 * each in the tab order would make the page unusable with a keyboard. The
	 * inspector's own search field is the keyboard and screen-reader route to the
	 * same data.
	 */
	function handleClick(event: MouseEvent) {
		if (!settings.annotations) return;
		const target = (event.target as HTMLElement | null)?.closest('.w');
		if (target?.textContent) onselect(target.textContent);
	}

	// Light up every other occurrence of the inspected word. Done against the DOM
	// rather than in the markup so the text itself never re-renders.
	$effect(() => {
		if (!root) return;
		const key = selected ? normalise(selected) : null;
		for (const mark of root.querySelectorAll<HTMLElement>('.w.is-selected')) {
			mark.classList.remove('is-selected');
		}
		if (!key || !settings.annotations) return;
		for (const mark of root.querySelectorAll<HTMLElement>('.w')) {
			if (normalise(mark.textContent ?? '') === key) mark.classList.add('is-selected');
		}
	});
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div
	class="reader {settings.hiddenClasses}"
	bind:this={root}
	data-scheme={settings.scheme}
	data-annotations={settings.annotations ? 'on' : 'off'}
	style="--intensity: {settings.intensity}"
	onclick={handleClick}
>
	{#each sections as section (section.id)}
		<section class="cat" id={section.id} aria-labelledby="{section.id}-heading">
			<h2 id="{section.id}-heading">
				<span>{section.title}</span>
				<span class="count label numeric">{section.portraits.length}</span>
			</h2>
			<div class="portraits">
				{#each section.portraits as portrait (portrait.id)}
					<Portrait {portrait} />
				{/each}
			</div>
		</section>
	{/each}
</div>

<style>
	.reader {
		display: flex;
		flex-direction: column;
		gap: 5rem;
	}

	.cat {
		display: flex;
		flex-direction: column;
		gap: 2.6rem;
		scroll-margin-top: 5rem;
	}

	h2 {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1rem;
		margin: 0;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid var(--ink);
		font-size: 2.1rem;
		font-weight: 300;
		letter-spacing: 0.02em;
	}

	.count {
		flex: none;
	}

	.portraits {
		display: flex;
		flex-direction: column;
		gap: 2.8rem;
	}
</style>
