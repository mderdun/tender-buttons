<script lang="ts">
	import { SCHEMES } from '$lib/senses';
	import stats from '$lib/data/stats.json';

	const counts: Record<string, number> = stats.perceptualCounts;
	const total = Object.values(counts).reduce((sum, n) => sum + n, 0);

	// Ordered by share, so the bar reads as a ranking as well as a breakdown.
	const bands = SCHEMES.perceptual.categories
		.map((category) => ({
			...category,
			count: counts[category.id] ?? 0,
			share: (counts[category.id] ?? 0) / total
		}))
		.sort((a, b) => b.count - a.count);

	const dominant = bands[0];
</script>

<header class="masthead">
	<p class="label kind">Sensorimotor edition</p>
	<h1>Tender Buttons</h1>
	<p class="byline">Gertrude Stein, 1914</p>

	<div class="figure">
		<div
			class="bar"
			role="img"
			aria-label={bands.map((b) => `${b.label} ${Math.round(b.share * 100)}%`).join(', ')}
		>
			{#each bands as band (band.id)}
				<span
					class="band"
					style="--c: var(--s-{band.id}); flex: {band.count}"
					title="{band.label}: {band.count} words"
				></span>
			{/each}
		</div>
		<p class="caption">
			<span class="numeric">{total.toLocaleString('en')}</span> rated words.
			<span class="numeric">{Math.round(dominant.share * 100)}%</span> are dominantly
			{dominant.label.toLowerCase()} &mdash; before you read a line, the book is overwhelmingly a
			<em>{dominant.gloss}</em> thing.
		</p>
	</div>
</header>

<style>
	.masthead {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.kind {
		margin: 0;
	}

	h1 {
		margin: 0.15rem 0 0;
		font-size: 1.9rem;
		font-weight: 500;
		line-height: 1.08;
		letter-spacing: -0.01em;
	}

	.byline {
		margin: 0;
		font-size: 0.92rem;
		font-style: italic;
		color: var(--graphite);
	}

	.figure {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		margin-top: 0.85rem;
	}

	.bar {
		display: flex;
		height: 0.55rem;
		gap: 1px;
	}

	.band {
		background: var(--c);
		min-width: 2px;
	}

	.caption {
		margin: 0;
		font-size: 0.76rem;
		line-height: 1.5;
		color: var(--graphite);
	}

	.caption .numeric {
		color: var(--ink-2);
	}
</style>
