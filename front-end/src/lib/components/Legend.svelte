<script lang="ts">
	import { settings } from '$lib/settings.svelte';
	import { SCHEMES } from '$lib/senses';
	import stats from '$lib/data/stats.json';

	let scheme = $derived(SCHEMES[settings.scheme]);
	let hidden = $derived(settings.hidden[settings.scheme]);
	let anyHidden = $derived(hidden.size > 0);

	/**
	 * Share of the marks on the page, not of the vocabulary — the key doubles as
	 * the distribution, so it has to count what the reader is actually looking at.
	 */
	let counts = $derived(
		settings.scheme === 'perceptual' ? stats.perceptualTokens : stats.actionTokens
	) as Record<string, number>;

	let total = $derived(Object.values(counts).reduce((a, b) => a + b, 0));

	let shown = $derived(scheme.categories.filter((c) => !hidden.has(c.id)));
	let shownMarks = $derived(shown.reduce((n, c) => n + (counts[c.id] ?? 0), 0));

	const pct = (n: number) => ((n / total) * 100).toFixed(n / total < 0.01 ? 1 : 0);
</script>

<section class="key" aria-labelledby="key-heading">
	<div class="head">
		<h2 class="label" id="key-heading">Key</h2>
		{#if anyHidden}
			<button class="reset" onclick={() => settings.showAll()}>Show all</button>
		{/if}
	</div>

	<ul>
		{#each scheme.categories as category (category.id)}
			{@const off = hidden.has(category.id)}
			{@const n = counts[category.id] ?? 0}
			{@const alone = shown.length === 1 && !off}
			<li class:off>
				<button
					class="entry"
					aria-pressed={!off}
					onclick={() => settings.toggle(category.id)}
					title={off ? `Show ${category.label}` : `Hide ${category.label}`}
				>
					<span class="swatch" data-cat={category.id}></span>
					<span class="naming">
						<span class="name">{category.label}</span>
						<span class="gloss">{category.gloss}</span>
					</span>
					<span class="share numeric">{pct(n)}%</span>
				</button>
				<button
					class="only"
					aria-pressed={alone}
					onclick={() => settings.solo(category.id)}
					title={alone ? 'Show every category again' : `Show only ${category.label}`}
				>
					{alone ? 'all' : 'only'}<span class="visually-hidden">
						{alone ? ' — show every category again' : ` — show only ${category.label}`}</span
					>
				</button>
			</li>
		{/each}
	</ul>

	<!-- Hiding Sight removes 72% of the marking in one click. Saying so is the
	     difference between a filter and a vanishing page. -->
	<p class="state" role="status">
		{#if shown.length === 0}
			Every category is hidden, so nothing in the text is marked.
		{:else if anyHidden}
			Showing {shownMarks.toLocaleString('en')} of {total.toLocaleString('en')} marks.
		{/if}
	</p>
</section>

<style>
	.key {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.5rem;
	}

	h2 {
		margin: 0;
	}

	.reset {
		font-family: var(--sc);
		font-size: 0.78rem;
		letter-spacing: 0.04em;
		color: var(--graphite);
		text-decoration: underline;
		text-decoration-color: var(--rule-strong);
		text-underline-offset: 3px;
		padding: 0.2rem 0;
	}

	.reset:hover {
		color: var(--ink);
		text-decoration-color: currentColor;
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
	}

	li {
		display: flex;
		align-items: baseline;
		gap: 0.4rem;
		border-bottom: 1px solid var(--rule);
	}

	li:first-child {
		border-top: 1px solid var(--rule);
	}

	.entry {
		display: grid;
		grid-template-columns: 1.75rem minmax(0, 1fr) auto;
		align-items: baseline;
		gap: 0.5rem;
		flex: 1;
		min-width: 0;
		padding: 0.42rem 0;
		text-align: left;
		color: var(--ink-2);
	}

	.entry:hover .name {
		text-decoration: underline;
		text-decoration-color: var(--rule-strong);
		text-underline-offset: 3px;
	}

	/* Name and gloss share one cell and wrap together, so "Interoception" pushes
	   its reading onto a second line rather than crushing it. */
	.naming {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0 0.4rem;
		min-width: 0;
	}

	.name {
		font-family: var(--sc);
		font-size: 0.92rem;
		letter-spacing: 0.03em;
		white-space: nowrap;
	}

	/* The plain-language reading of the category. These strings have been in
	   senses.ts since the beginning, documented as appearing here, and were never
	   rendered by anything. */
	.gloss {
		font-size: 0.8rem;
		font-style: italic;
		color: var(--graphite);
		white-space: nowrap;
	}

	.share {
		font-size: 0.76rem;
		color: var(--graphite);
	}

	/* The swatch sits on the text baseline like a specimen in a table of signs,
	   rather than centred like an icon. */
	.entry .swatch {
		position: relative;
		top: 0.1em;
	}

	.only {
		font-family: var(--sc);
		font-size: 0.72rem;
		letter-spacing: 0.04em;
		color: var(--graphite);
		padding: 0.42rem 0 0.42rem 0.2rem;
		flex: none;
	}

	.only:hover,
	.only[aria-pressed='true'] {
		color: var(--ink);
	}

	li.off .swatch {
		opacity: 0.22;
	}

	li.off .name {
		text-decoration: line-through;
		text-decoration-color: var(--rule-strong);
	}

	li.off .entry {
		color: var(--graphite);
	}

	.state {
		margin: 0.1rem 0 0;
		font-size: 0.78rem;
		line-height: 1.45;
		color: var(--graphite);
	}

	.state:empty {
		display: none;
	}
</style>
