<script lang="ts">
	import { loadNorms, normalise } from '$lib/norms';
	import { DIMENSION_LABELS, MAX_RATING, SCHEMES } from '$lib/senses';
	import { settings } from '$lib/settings.svelte';
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
			else if (contains.length < 8) contains.push(key);
			// Both lists have to be full before the walk can stop; guarding on
			// `starts` alone meant a rare prefix scanned all 2,502 keys per
			// keystroke while `contains` grew without limit.
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

	function glossFor(scheme: 'perceptual' | 'action', id: string): string {
		return SCHEMES[scheme].categories.find((c) => c.id === id)?.gloss ?? '';
	}

	/** Exclusivity is 0-1; readers meet it as a percentage everywhere else. */
	const asPct = (value: number) => `${Math.round(value * 100)}%`;

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
			aria-describedby="suggestions-hint"
			autocomplete="off"
			spellcheck="false"
		/>
	</form>

	{#if suggestions.length}
		<p class="hint" id="suggestions-hint">Also rated</p>
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

	<!-- The record replaces itself silently otherwise, and the search field is
	     documented as the screen-reader route to this data. -->
	<p class="visually-hidden" role="status">
		{#if word && entry}
			{word.toLowerCase()}: {labelFor('perceptual', entry.perceptual)} by sense,
			{labelFor('action', entry.action)} by body.
		{:else if word && table && !entry}
			{word.toLowerCase()} is not in the Lancaster norms.
		{/if}
	</p>

	{#if failed}
		<p class="note">The norm table could not be loaded. Reload the page to try again.</p>
	{:else if word}
		<!-- tabindex so a narrow-screen selection can send focus straight here. -->
		<div class="record" tabindex="-1">
			<div class="head">
				<h3>{word.toLowerCase()}</h3>
				<button class="clear" onclick={onclear} aria-label="Close word details">Close</button>
			</div>

			{#if !table}
				<p class="note">Loading the norm table…</p>
			{:else if !entry}
				<p class="note">
					Not in the Lancaster norms. Stein's coinages and a few archaic spellings have no rating,
					so they are left unmarked in the text.
				</p>
			{:else}
				{#if !settings.annotations}
					<p class="note">
						Marking is switched off, so this word is not underlined anywhere in the text.
					</p>
				{/if}

				<dl class="readings">
					<div>
						<dt class="label">Sense</dt>
						<dd>
							<span class="swatch" data-cat={entry.perceptual}></span>
							<span class="reading">{labelFor('perceptual', entry.perceptual)}</span>
							<span class="gloss">{glossFor('perceptual', entry.perceptual)}</span>
							<span class="excl numeric">{asPct(entry.perceptualExclusivity)}</span>
						</dd>
					</div>
					<div>
						<dt class="label">Body</dt>
						<dd>
							<span class="swatch" data-cat={entry.action}></span>
							<span class="reading">{labelFor('action', entry.action)}</span>
							<span class="gloss">{glossFor('action', entry.action)}</span>
							<span class="excl numeric">{asPct(entry.actionExclusivity)}</span>
						</dd>
					</div>
				</dl>

				<p class="note">
					The percentage is <em>exclusivity</em>: how far that one category leads the other five. A
					high figure means the word reaches for a single sense, a low one that it reaches for
					several at once. It sets the weight of the underline in the text.
				</p>

				<table class="ratings">
					<caption class="label">Ratings <span class="scale numeric">0–{MAX_RATING}</span></caption>
					<tbody>
						{#each ranked as dimension (dimension.id)}
							<tr>
								<th scope="row">{dimension.label}</th>
								<td class="plot">
									<span
										class="fill"
										style="--c: var(--s-{dimension.id}); width: {(dimension.value / MAX_RATING) *
											100}%"
									></span>
								</td>
								<td class="val numeric">{dimension.value.toFixed(2)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</div>
	{/if}
</section>

<style>
	.inspector {
		display: flex;
		flex-direction: column;
		gap: 0.55rem;
	}

	h2 {
		margin: 0;
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
	}

	input::placeholder {
		color: var(--graphite);
		opacity: 1;
	}

	.hint {
		margin: 0;
		font-family: var(--sc);
		font-size: 0.74rem;
		letter-spacing: 0.04em;
		color: var(--graphite);
	}

	.suggestions {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem 0.5rem;
	}

	/* Words, so they are set in the text face and italicised the way a cited form
	   is — not as monospace chips. */
	.suggestions button {
		font-size: 0.86rem;
		font-style: italic;
		padding: 0.24rem 0;
		color: var(--graphite);
		text-decoration: underline;
		text-decoration-color: var(--rule-strong);
		text-underline-offset: 3px;
	}

	.suggestions button:hover {
		color: var(--ink);
		text-decoration-color: currentColor;
	}

	.note {
		margin: 0;
		font-size: 0.8rem;
		line-height: 1.55;
		color: var(--graphite);
		text-wrap: pretty;
	}

	.note em {
		font-style: italic;
		color: var(--ink-2);
	}

	.record:focus {
		outline: none;
	}

	.record:focus-visible {
		outline: 2px solid var(--ink);
		outline-offset: 4px;
	}

	.record {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		padding-top: 0.5rem;
		border-top: 1px solid var(--ink);
	}

	.head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.5rem;
	}

	h3 {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 500;
		font-style: italic;
		line-height: 1.2;
		overflow-wrap: anywhere;
	}

	.clear {
		font-family: var(--sc);
		font-size: 0.78rem;
		letter-spacing: 0.04em;
		color: var(--graphite);
		text-decoration: underline;
		text-decoration-color: var(--rule-strong);
		text-underline-offset: 3px;
		padding: 0.25rem 0;
		flex: none;
	}

	.clear:hover {
		color: var(--ink);
		text-decoration-color: currentColor;
	}

	.readings {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
		margin: 0;
	}

	.readings div {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	dt {
		margin: 0;
	}

	dd {
		display: flex;
		align-items: baseline;
		gap: 0.4rem;
		margin: 0;
		font-size: 0.92rem;
		min-width: 0;
	}

	dd .swatch {
		position: relative;
		top: 0.1em;
	}

	.reading {
		font-family: var(--sc);
		letter-spacing: 0.03em;
		white-space: nowrap;
	}

	.gloss {
		font-size: 0.8rem;
		font-style: italic;
		color: var(--graphite);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.excl {
		margin-left: auto;
		font-size: 0.78rem;
		color: var(--ink-2);
		flex: none;
	}

	/* Set as a ruled table, which is what it is: eleven readings against a scale.
	   The rule length is the same figure the column states, so the quantity is
	   never carried by the drawing alone. */
	.ratings {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.78rem;
	}

	caption.label {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.5rem;
		text-align: left;
		padding-bottom: 0.25rem;
	}

	.scale {
		font-family: var(--serif);
		letter-spacing: 0;
		color: var(--rule-strong);
	}

	.ratings tr {
		border-bottom: 1px solid var(--rule);
	}

	.ratings th {
		font-weight: 400;
		text-align: left;
		padding: 0.22rem 0.4rem 0.22rem 0;
		color: var(--ink-2);
		white-space: nowrap;
	}

	.plot {
		width: 100%;
		padding: 0.22rem 0.4rem;
	}

	.fill {
		display: block;
		height: 0.42rem;
		background: var(--c);
	}

	.val {
		padding: 0.22rem 0 0.22rem 0.4rem;
		text-align: right;
		color: var(--ink-2);
		white-space: nowrap;
	}
</style>
