<script lang="ts">
	import Segments from './Segments.svelte';
	import type { Portrait } from '$lib/types';

	let { portrait }: { portrait: Portrait } = $props();
</script>

<article class="portrait" id={portrait.id}>
	<h3>
		<Segments segments={portrait.title} />{#if portrait.repeat}<span class="repeat numeric"
				>{portrait.repeat}</span
			>{/if}
	</h3>
	{#each portrait.paragraphs as paragraph, i (i)}
		<p><Segments segments={paragraph} /></p>
	{/each}
</article>

<style>
	/* Type and indents as the original set them. */
	.portrait {
		margin-bottom: 3rem;
		scroll-margin-top: 2rem;
	}

	h3 {
		font-size: 1.5em;
		font-weight: 100;
		margin: 0 0 0.3em;
	}

	.repeat {
		font-size: 0.55em;
		vertical-align: super;
		color: var(--graphite);
		margin-left: 0.15em;
	}

	p {
		font-size: 1.3em;
		line-height: 1.8em;
		font-weight: 100;
		margin: 0 0;
	}

	p:not(:first-of-type)::before {
		content: ' ';
		width: 3rem;
		display: inline-block;
	}
</style>
