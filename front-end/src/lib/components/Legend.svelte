<script lang="ts">
	import { settings } from '$lib/settings.svelte';
	import { SCHEMES } from '$lib/senses';

	let scheme = $derived(SCHEMES[settings.scheme]);
	let anyHidden = $derived(settings.hidden[settings.scheme].size > 0);
</script>

<div class="legend">
	<div class="head">
		<h2 class="label">Key</h2>
		{#if anyHidden}
			<button class="reset label" onclick={() => settings.showAll()}>Show all</button>
		{/if}
	</div>
	<ul>
		{#each scheme.categories as category (category.id)}
			{@const hidden = settings.hidden[settings.scheme].has(category.id)}
			<li>
				<button
					class="entry"
					class:hidden
					aria-pressed={!hidden}
					title="Click to hide, double-click to isolate"
					onclick={() => settings.toggle(category.id)}
					ondblclick={() => settings.solo(category.id)}
				>
					<span class="swatch" data-cat={category.id}></span>
					<span class="name">{category.label}</span>
				</button>
			</li>
		{/each}
	</ul>
</div>

<style>
	.legend {
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
		color: var(--graphite);
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.reset:hover {
		color: var(--ink);
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
	}

	.entry {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		width: 100%;
		padding: 0.3rem 0;
		text-align: left;
		font-size: 0.95rem;
		color: var(--graphite);
	}

	.entry:hover {
		color: var(--ink);
	}

	.name {
		flex: 1;
		min-width: 0;
	}

	.entry.hidden .swatch {
		opacity: 0.22;
	}

	.entry.hidden .name {
		text-decoration: line-through;
		text-decoration-color: var(--rule-strong);
	}
</style>
