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

	let matches = $derived.by(() => {
		const needle = filter.trim().toLowerCase();
		return sections
			.map((section) => ({
				...section,
				portraits: needle
					? section.portraits.filter((p) => p.titleText.toLowerCase().includes(needle))
					: section.portraits
			}))
			.filter((section) => section.portraits.length > 0);
	});
</script>

<nav class="contents" aria-label="Contents">
	<input
		type="search"
		bind:value={filter}
		placeholder="Filter titles"
		aria-label="Filter portraits by title"
		autocomplete="off"
	/>

	{#each matches as section (section.id)}
		<div class="section">
			<a class="section-link" href="#{section.id}">{section.title}</a>
			<ul>
				{#each section.portraits as portrait (portrait.id)}
					<li>
						<a href="#{portrait.id}" class:active={activeId === portrait.id}>
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
		padding: 0.35rem 0.5rem;
		background: var(--surface);
		color: var(--ink);
		border: 1px solid var(--rule-strong);
		border-radius: 0;
		flex: none;
	}

	input::placeholder {
		color: var(--graphite);
	}

	.section {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}

	.section-link {
		text-transform: uppercase;
		font-size: 1.5rem;
		line-height: 1.15;
		color: var(--graphite);
		text-decoration: none;
		transition: all 0.3s ease;
	}

	.section-link:hover {
		color: var(--ink);
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
		padding: 0.13rem 0;
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
		font-size: 0.68rem;
		text-align: right;
		color: var(--rule-strong);
		padding-top: 0.15em;
	}

	.title {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.repeat {
		font-size: 0.7em;
		vertical-align: super;
		margin-left: 0.1em;
	}

	.empty {
		margin: 0;
		font-size: 0.82rem;
		color: var(--graphite);
	}
</style>
