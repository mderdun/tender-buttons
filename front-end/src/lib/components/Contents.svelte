<script lang="ts">
	import type { Section } from '$lib/types';

	let {
		sections,
		activeId
	}: {
		sections: Section[];
		activeId: string | null;
	} = $props();

	let filter = $state('');
	let list = $state<HTMLElement | null>(null);

	let matches = $derived.by(() => {
		const needle = filter.trim().toLowerCase();
		return sections
			.map((section) => ({
				...section,
				total: section.portraits.length,
				portraits: needle
					? section.portraits.filter((p) => p.titleText.toLowerCase().includes(needle))
					: section.portraits
			}))
			.filter((section) => section.portraits.length > 0);
	});

	let found = $derived(matches.reduce((n, section) => n + section.portraits.length, 0));

	/**
	 * Keep the current portrait's entry inside the rail's own scroll region.
	 *
	 * The list is around 3,000px against an 800px viewport, so without this the
	 * marker is correct but invisible from roughly the thirtieth entry onward —
	 * which is most of the book. `nearest` scrolls only when the entry is
	 * actually out of view, so reading down the page does not drag the rail on
	 * every portrait.
	 */
	$effect(() => {
		if (!activeId || !list) return;
		const entry = list.querySelector<HTMLElement>(`a[href="#${activeId}"]`);
		entry?.scrollIntoView({ block: 'nearest' });
	});
</script>

<nav class="contents" aria-label="Contents" bind:this={list}>
	<input
		type="search"
		bind:value={filter}
		placeholder="Filter titles"
		aria-label="Filter portraits by title"
		autocomplete="off"
	/>

	<!-- Announces the filter result, which otherwise changes silently. -->
	<p class="visually-hidden" role="status">
		{#if filter.trim()}
			{found}
			{found === 1 ? 'portrait' : 'portraits'} match “{filter.trim()}”.
		{/if}
	</p>

	{#each matches as section (section.id)}
		<div class="section">
			<a class="section-link" href="#{section.id}">
				{section.title}<span class="count numeric" aria-hidden="true">{section.total}</span>
			</a>
			<ul>
				{#each section.portraits as portrait (portrait.id)}
					<li>
						<a
							href="#{portrait.id}"
							class:active={activeId === portrait.id}
							aria-current={activeId === portrait.id ? 'true' : undefined}
						>
							<span class="n numeric">{portrait.n}</span>
							<span class="title"
								>{portrait.titleText.toLowerCase()}{#if portrait.repeat}<span class="repeat numeric"
										>{portrait.repeat}</span
									>{/if}</span
							>
						</a>
					</li>
				{/each}
			</ul>
		</div>
	{:else}
		<p class="empty">No portrait title matches that.</p>
	{/each}
</nav>

<style>
	.contents {
		display: flex;
		flex-direction: column;
		gap: 0.9rem;
		min-height: 0;
	}

	input {
		width: 100%;
		font: inherit;
		font-size: 0.9rem;
		padding: 0.4rem 0.5rem;
		background: var(--surface);
		color: var(--ink);
		border: 1px solid var(--rule-strong);
		border-radius: 0;
		flex: none;
	}

	input::placeholder {
		color: var(--graphite);
		opacity: 1;
	}

	.section {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}

	.section-link {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.5rem;
		font-family: var(--sc);
		font-size: 1.45rem;
		line-height: 1.15;
		color: var(--graphite);
		text-decoration: none;
		transition: color 200ms ease;
	}

	.section-link:hover {
		color: var(--ink);
	}

	/* How many portraits the division holds — the reader's only sense of how much
	   of the book is left. */
	.count {
		font-size: 0.72rem;
		color: var(--rule-strong);
		letter-spacing: 0.04em;
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	li a {
		display: grid;
		grid-template-columns: 1.7rem 1fr;
		gap: 0.35rem;
		/* 0.13rem gave a 22.8px row, under the 24px minimum target and with no
		   gap between rows for the spacing exception to apply. */
		padding: 0.3rem 0;
		font-size: 0.83rem;
		line-height: 1.4;
		color: var(--graphite);
		text-decoration: none;
	}

	li a:hover {
		color: var(--ink);
	}

	li a.active {
		color: var(--ink);
		font-weight: 500;
	}

	li a.active .n {
		color: var(--ink);
	}

	.n {
		/* Was 0.68rem in --rule-strong: 10.9px at 2.2:1, the worst contrast on the
		   page and below the functional-text floor. */
		font-size: 0.72rem;
		text-align: right;
		color: var(--graphite);
		padding-top: 0.15em;
	}

	.title {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.repeat {
		/* 0.7em of 0.83rem rendered at 9.3px. */
		font-size: 0.85em;
		vertical-align: super;
		margin-left: 0.1em;
	}

	.empty {
		margin: 0;
		font-size: 0.82rem;
		color: var(--graphite);
	}
</style>
