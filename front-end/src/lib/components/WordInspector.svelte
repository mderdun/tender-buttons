<script lang="ts">
	import { loadNorms, normalise } from '$lib/norms';
	import { DIMENSION_LABELS, MAX_RATING, SCHEMES } from '$lib/senses';
	import type { WordNorms } from '$lib/types';

	let {
		word,
		onselect,
		onclear
	}: {
		word: string | null;
		onselect: (word: string) => void;
		onclear: () => void;
	} = $props();

	let table = $state<Map<string, WordNorms> | null>(null);
	let failed = $state(false);
	let query = $state('');

	// The table is only pulled once someone actually asks about a word.
	$effect(() => {
		if (!word && !query) return;
		if (table || failed) return;
		loadNorms().then(
			(loaded) => (table = loaded),
			() => (failed = true)
		);
	});

	let entry = $derived(word && table ? (table.get(normalise(word)) ?? null) : null);

	let suggestions = $derived.by(() => {
		const needle = normalise(query);
		if (!needle || !table) return [];
		const starts: string[] = [];
		const contains: string[] = [];
		for (const key of table.keys()) {
			if (key === needle) continue;
			if (key.startsWith(needle)) starts.push(key);
			else if (key.includes(needle)) contains.push(key);
			if (starts.length >= 8) break;
		}
		return [...starts, ...contains].slice(0, 8);
	});

	let ranked = $derived.by(() => {
		if (!entry) return [];
		return Object.entries(entry.means)
			.map(([id, value]) => ({ id, value, label: DIMENSION_LABELS[id] ?? id }))
			.sort((a, b) => b.value - a.value);
	});

	function labelFor(scheme: 'perceptual' | 'action', id: string): string {
		return SCHEMES[scheme].categories.find((c) => c.id === id)?.label ?? id;
	}

	function submit(event: SubmitEvent) {
		event.preventDefault();
		const first = normalise(query);
		if (!first) return;
		if (table?.has(first)) {
			onselect(first);
			query = '';
		} else if (suggestions.length) {
			onselect(suggestions[0]);
			query = '';
		}
	}
</script>

<section class="inspector" aria-labelledby="inspector-heading">
	<h2 class="label" id="inspector-heading">Word</h2>

	<form onsubmit={submit}>
		<input
			type="search"
			bind:value={query}
			placeholder="Look up a word"
			aria-label="Look up a word in the sensorimotor norms"
			autocomplete="off"
			spellcheck="false"
		/>
	</form>

	{#if suggestions.length}
		<ul class="suggestions">
			{#each suggestions as suggestion (suggestion)}
				<li>
					<button
						onclick={() => {
							onselect(suggestion);
							query = '';
						}}>{suggestion}</button
					>
				</li>
			{/each}
		</ul>
	{/if}

	{#if failed}
		<p class="note">The norm table could not be loaded. Reload the page to try again.</p>
	{:else if word}
		<div class="record">
			<div class="head">
				<h3>{word.toLowerCase()}</h3>
				<button class="clear label" onclick={onclear} aria-label="Close word details">Close</button>
			</div>

			{#if !table}
				<p class="note">Loading the norm table…</p>
			{:else if !entry}
				<p class="note">
					Not in the Lancaster norms. Stein's coinages and a few archaic spellings have no rating,
					so they are left unmarked in the text.
				</p>
			{:else}
				<dl class="dominance">
					<div>
						<dt class="label">Sense</dt>
						<dd>
							<span class="swatch" data-cat={entry.perceptual}></span>
							{labelFor('perceptual', entry.perceptual)}
							<span class="excl numeric">{entry.perceptualExclusivity.toFixed(2)}</span>
						</dd>
					</div>
					<div>
						<dt class="label">Body</dt>
						<dd>
							<span class="swatch" data-cat={entry.action}></span>
							{labelFor('action', entry.action)}
							<span class="excl numeric">{entry.actionExclusivity.toFixed(2)}</span>
						</dd>
					</div>
				</dl>

				<p class="caption">
					Mean rating on each of the eleven dimensions, 0&ndash;{MAX_RATING}. The figures beside the
					two headings above are exclusivity &mdash; how far a single dimension dominates the rest.
				</p>

				<ul class="bars">
					{#each ranked as dimension (dimension.id)}
						<li>
							<span class="dim">{dimension.label}</span>
							<span class="bar" aria-hidden="true">
								<span
									class="fill"
									style="--c: var(--s-{dimension.id}); width: {(dimension.value / MAX_RATING) *
										100}%"
								></span>
							</span>
							<span class="val numeric">{dimension.value.toFixed(2)}</span>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	{:else}
		<p class="note">
			Select any marked word in the text, or search above, to see its full sensorimotor profile.
		</p>
	{/if}
</section>

<style>
	.inspector {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	h2 {
		margin: 0;
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
	}

	input::placeholder {
		color: var(--graphite);
	}

	.suggestions {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
	}

	.suggestions button {
		font-family: var(--mono);
		font-size: 0.72rem;
		padding: 0.12rem 0.35rem;
		border: 1px solid var(--rule);
		color: var(--graphite);
	}

	.suggestions button:hover {
		border-color: var(--ink);
		color: var(--ink);
	}

	.note {
		margin: 0;
		font-size: 0.82rem;
		line-height: 1.5;
		color: var(--graphite);
	}

	.record {
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
		padding-top: 0.5rem;
		border-top: 1px solid var(--rule);
	}

	.head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.5rem;
	}

	h3 {
		margin: 0;
		font-size: 1.35rem;
		font-weight: 500;
		font-style: italic;
		line-height: 1.2;
		overflow-wrap: anywhere;
	}

	.clear {
		color: var(--graphite);
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.clear:hover {
		color: var(--ink);
	}

	.dominance {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		margin: 0;
	}

	.dominance div {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	dt {
		margin: 0;
	}

	dd {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		margin: 0;
		font-size: 0.92rem;
	}

	.excl {
		margin-left: auto;
		font-size: 0.74rem;
		color: var(--graphite);
	}

	.caption {
		margin: 0;
		font-size: 0.74rem;
		line-height: 1.45;
		color: var(--graphite);
	}

	.bars {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.22rem;
	}

	.bars li {
		display: grid;
		grid-template-columns: 5.4rem 1fr 2.2rem;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.72rem;
	}

	.dim {
		color: var(--ink-2);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.bar {
		height: 0.5rem;
		background: var(--sunken);
	}

	.fill {
		display: block;
		height: 100%;
		background: var(--c);
	}

	.val {
		color: var(--graphite);
		text-align: right;
	}
</style>
