<script lang="ts">
	import Segments from './Segments.svelte';
	import type { Portrait } from '$lib/types';

	let { portrait }: { portrait: Portrait } = $props();
</script>

<article class="portrait" id={portrait.id}>
	<h3>
		<span class="n numeric" aria-hidden="true">{portrait.n}</span>
		<span class="t"
			><Segments segments={portrait.title} />{#if portrait.repeat}<span
					class="repeat numeric"
					title="The {portrait.repeat === 2
						? 'second'
						: 'third or later'} portrait to carry this title">{portrait.repeat}</span
				>{/if}</span
		>
	</h3>
	{#each portrait.paragraphs as paragraph, i (i)}
		<p><Segments segments={paragraph} /></p>
	{/each}
</article>

<style>
	.portrait {
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
		scroll-margin-top: 5rem;
	}

	h3 {
		display: grid;
		grid-template-columns: 2.5rem 1fr;
		align-items: baseline;
		gap: 0 0.5rem;
		margin: 0 0 0.15rem;
		font-size: 1.02rem;
		font-weight: 600;
		letter-spacing: 0.09em;
		line-height: 1.45;
		text-wrap: balance;
	}

	.n {
		font-size: 0.68rem;
		font-weight: 400;
		letter-spacing: 0.05em;
		color: var(--graphite);
		text-align: right;
	}

	.repeat {
		font-size: 0.62em;
		vertical-align: super;
		color: var(--graphite);
		margin-left: 0.15em;
		letter-spacing: 0;
	}

	p {
		margin: 0;
		grid-column: 2;
		font-size: 1.06rem;
		line-height: 1.75;
		hanging-punctuation: first;
	}

	p + p {
		text-indent: 1.6rem;
	}

	/* Keep the prose aligned with the title, leaving the ordinal in its own gutter. */
	.portrait > p {
		margin-left: 3rem;
	}

	@media (max-width: 720px) {
		h3 {
			grid-template-columns: 1.7rem 1fr;
		}
		.portrait > p {
			margin-left: 0;
		}
	}
</style>
