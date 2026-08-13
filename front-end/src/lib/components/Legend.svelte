<script lang="ts">
	import { settings } from '$lib/settings.svelte';
	import { SCHEMES } from '$lib/senses';
	import stats from '$lib/data/stats.json';

	const counts: Record<string, Record<string, number>> = {
		perceptual: stats.perceptualCounts,
		action: stats.actionCounts
	};

	let scheme = $derived(SCHEMES[settings.scheme]);
	let schemeCounts = $derived(counts[settings.scheme]);
	let total = $derived(Object.values(schemeCounts).reduce((sum, n) => sum + n, 0));
	let anyHidden = $derived(settings.hidden[settings.scheme].size > 0);
</script>

<div class="legend">
	<div class="head">
		<h2 class="label">{scheme.label}</h2>
		{#if anyHidden}
			<button class="reset label" onclick={() => settings.showAll()}>Show all</button>
		{/if}
	</div>
	<p class="hint">{scheme.description} Click to hide a category, double-click to isolate it.</p>
	<ul>
		{#each scheme.categories as category (category.id)}
			{@const hidden = settings.hidden[settings.scheme].has(category.id)}
			{@const share = schemeCounts[category.id] ?? 0}
			<li>
				<button
					class="entry"
					class:hidden
					aria-pressed={!hidden}
					onclick={() => settings.toggle(category.id)}
					ondblclick={() => settings.solo(category.id)}
				>
					<span class="swatch" data-cat={category.id}></span>
					<span class="name">{category.label}</span>
					<span class="share numeric">{Math.round((share / total) * 100)}%</span>
				</button>
			</li>
		{/each}
	</ul>
</div>

<style>
	.legend {
		display: flex;
		flex-direction: column;
		gap: 0.55rem;
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
		color: var(--graphite);
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.reset:hover {
		color: var(--ink);
	}

	.hint {
		margin: 0;
		font-size: 0.8rem;
		line-height: 1.45;
		color: var(--graphite);
	}

	ul {
		list-style: none;
		margin: 0.2rem 0 0;
		padding: 0;
		display: flex;
		flex-direction: column;
	}

	.entry {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		width: 100%;
		padding: 0.32rem 0;
		text-align: left;
		font-size: 0.88rem;
	}

	.name {
		flex: 1;
		min-width: 0;
	}

	.share {
		font-size: 0.72rem;
		color: var(--graphite);
	}

	.entry.hidden {
		color: var(--graphite);
	}

	.entry.hidden .swatch {
		opacity: 0.22;
	}

	.entry.hidden .name {
		text-decoration: line-through;
		text-decoration-color: var(--rule-strong);
	}

	.entry:hover .name {
		text-decoration: underline;
		text-underline-offset: 2px;
	}
</style>
