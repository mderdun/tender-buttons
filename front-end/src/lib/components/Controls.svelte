<script lang="ts">
	import { settings } from '$lib/settings.svelte';
	import { SCHEME_LIST } from '$lib/senses';
</script>

<!--
	The apparatus reads as a set of chosen readings rather than as a settings
	panel: a line of alternatives with the current one taken. The controls are
	real radios and a real checkbox under the styling, so arrow-key and space
	behaviour, grouping and announcement all come from the platform.
-->
<div class="controls">
	<div class="line">
		<span class="label">Text</span>
		<label class="check">
			<input type="checkbox" bind:checked={settings.annotations} />
			<span class="box" aria-hidden="true"></span>
			<span class="text">marked</span>
		</label>
	</div>

	<fieldset class="line" disabled={!settings.annotations}>
		<legend class="label">Reading</legend>
		<div class="choices">
			{#each SCHEME_LIST as scheme (scheme.id)}
				<label class="choice" class:on={settings.scheme === scheme.id}>
					<input
						type="radio"
						name="scheme"
						value={scheme.id}
						checked={settings.scheme === scheme.id}
						onchange={() => (settings.scheme = scheme.id)}
					/>
					<span class="text">{scheme.label}</span>
				</label>
			{/each}
		</div>
	</fieldset>

	<p class="gloss">
		{#if !settings.annotations}
			The text is unmarked. Every word is Stein's.
		{:else}
			{SCHEME_LIST.find((s) => s.id === settings.scheme)?.description}
		{/if}
	</p>
</div>

<style>
	.controls {
		display: flex;
		flex-direction: column;
		gap: 0.55rem;
	}

	.line {
		display: flex;
		align-items: baseline;
		gap: 0.7rem;
		border: none;
		margin: 0;
		padding: 0;
		min-width: 0;
	}

	legend.label {
		padding: 0;
		float: left;
	}

	.choices {
		display: flex;
		align-items: baseline;
		gap: 0.7rem;
		min-width: 0;
	}

	fieldset:disabled .choices {
		opacity: 0.45;
	}

	/* -- the taken reading -- */

	.choice,
	.check {
		display: flex;
		align-items: baseline;
		gap: 0.4rem;
		cursor: pointer;
		padding: 0.28rem 0;
		font-size: 0.92rem;
		color: var(--graphite);
	}

	.choice input,
	.check input {
		position: absolute;
		width: 1px;
		height: 1px;
		opacity: 0;
		margin: 0;
	}

	.choice:hover .text,
	.check:hover .text {
		color: var(--ink);
	}

	/* The chosen alternative is the one set in ink and ruled under, the way a
	   preferred reading is marked in an apparatus. */
	.choice.on .text {
		color: var(--ink);
		font-weight: 600;
		border-bottom: 2px solid var(--ink);
	}

	.choice input:focus-visible ~ .text,
	.check input:focus-visible ~ .box {
		outline: 2px solid var(--ink);
		outline-offset: 3px;
	}

	.text {
		transition: color 160ms ease;
	}

	/* A ruled box that takes a mark, not a switch. */
	.box {
		position: relative;
		top: 0.08em;
		width: 0.78rem;
		height: 0.78rem;
		border: 1px solid var(--rule-strong);
		background: var(--surface);
		flex: none;
	}

	.check input:checked ~ .box {
		background: var(--ink);
		border-color: var(--ink);
	}

	.check input:checked ~ .box::after {
		content: '';
		position: absolute;
		inset: 0.16rem;
		background: var(--paper);
	}

	.check input:checked ~ .text {
		color: var(--ink);
	}

	.gloss {
		margin: 0;
		font-size: 0.8rem;
		font-style: italic;
		line-height: 1.5;
		color: var(--graphite);
		text-wrap: pretty;
	}
</style>
