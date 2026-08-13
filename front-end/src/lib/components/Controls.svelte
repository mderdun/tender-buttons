<script lang="ts">
	import { settings } from '$lib/settings.svelte';
	import { SCHEME_LIST } from '$lib/senses';
</script>

<div class="controls">
	<div class="row">
		<label class="switch">
			<input type="checkbox" bind:checked={settings.annotations} />
			<span class="track" aria-hidden="true"><span class="knob"></span></span>
			<span class="label">Annotation</span>
		</label>
	</div>

	<fieldset disabled={!settings.annotations}>
		<legend class="label">Colour by</legend>
		<div class="segmented">
			{#each SCHEME_LIST as scheme (scheme.id)}
				<button
					class="seg"
					class:on={settings.scheme === scheme.id}
					aria-pressed={settings.scheme === scheme.id}
					onclick={() => (settings.scheme = scheme.id)}
				>
					{scheme.label}
				</button>
			{/each}
		</div>
	</fieldset>
</div>

<style>
	.controls {
		display: flex;
		flex-direction: column;
		gap: 0.9rem;
	}

	fieldset {
		border: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	fieldset:disabled {
		opacity: 0.4;
	}

	legend {
		padding: 0;
		margin-bottom: 0.4rem;
	}

	.row {
		display: flex;
	}

	/* -- toggle -- */

	.switch {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		cursor: pointer;
	}

	.switch input {
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
	}

	.track {
		width: 2.1rem;
		height: 1.1rem;
		border: 1px solid var(--rule-strong);
		background: var(--sunken);
		display: flex;
		align-items: center;
		padding: 2px;
		transition: background 140ms ease;
	}

	.knob {
		width: 0.72rem;
		height: 0.72rem;
		background: var(--graphite);
		transition:
			transform 140ms ease,
			background 140ms ease;
	}

	.switch input:checked + .track {
		background: var(--ink);
		border-color: var(--ink);
	}

	.switch input:checked + .track .knob {
		transform: translateX(0.92rem);
		background: var(--paper);
	}

	.switch input:focus-visible + .track {
		outline: 2px solid var(--ink);
		outline-offset: 2px;
	}

	/* -- segmented control -- */

	.segmented {
		display: flex;
		border: 1px solid var(--rule-strong);
	}

	.seg {
		flex: 1;
		padding: 0.36rem 0.5rem;
		font-family: var(--mono);
		font-size: 0.72rem;
		letter-spacing: 0.06em;
		color: var(--graphite);
	}

	.seg + .seg {
		border-left: 1px solid var(--rule-strong);
	}

	.seg.on {
		background: var(--ink);
		color: var(--paper);
	}

	.seg:not(.on):hover {
		background: var(--sunken);
		color: var(--ink);
	}
</style>
