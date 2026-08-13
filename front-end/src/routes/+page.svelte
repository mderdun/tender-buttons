<script lang="ts">
	import Contents from '$lib/components/Contents.svelte';
	import Controls from '$lib/components/Controls.svelte';
	import Legend from '$lib/components/Legend.svelte';
	import Masthead from '$lib/components/Masthead.svelte';
	import Reader from '$lib/components/Reader.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import WordInspector from '$lib/components/WordInspector.svelte';
	import Colophon from '$lib/components/Colophon.svelte';
	import { settings } from '$lib/settings.svelte';
	import corpus from '$lib/data/portraits.json';
	import type { Corpus } from '$lib/types';

	const { sections } = corpus as Corpus;

	let selected = $state<string | null>(null);
	let activeId = $state<string | null>(null);
	let panel = $state<'contents' | 'apparatus' | null>(null);

	// Scroll-spy: whichever portrait most recently crossed the top third of the
	// viewport is the one the contents list marks as current.
	$effect(() => {
		const portraits = document.querySelectorAll<HTMLElement>('article.portrait');
		const visible: Record<string, boolean> = {};

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) visible[entry.target.id] = entry.isIntersecting;
				for (const portrait of portraits) {
					if (visible[portrait.id]) {
						activeId = portrait.id;
						break;
					}
				}
			},
			{ rootMargin: '-12% 0px -70% 0px' }
		);

		for (const portrait of portraits) observer.observe(portrait);
		return () => observer.disconnect();
	});

	// persist() reads every setting, which is what registers them as dependencies.
	$effect(() => {
		settings.persist();
	});

	function select(word: string) {
		selected = word;
		if (window.matchMedia('(max-width: 1180px)').matches) panel = 'apparatus';
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			if (panel) panel = null;
			else selected = null;
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<svelte:head>
	<title>Tender Buttons — a sensorimotor edition</title>
</svelte:head>

<a class="skip" href="#objects">Skip to the text</a>

<Masthead />

<div class="shell" class:panel-open={panel !== null}>
	<div class="topbar">
		<button
			class="tab label"
			aria-expanded={panel === 'contents'}
			onclick={() => (panel = panel === 'contents' ? null : 'contents')}
		>
			Contents
		</button>
		<span class="topbar-title">Tender Buttons</span>
		<button
			class="tab label"
			aria-expanded={panel === 'apparatus'}
			onclick={() => (panel = panel === 'apparatus' ? null : 'apparatus')}
		>
			Marking
		</button>
	</div>

	<aside class="rail left" class:open={panel === 'contents'} aria-label="Contents and index">
		<div class="rail-inner">
			<h2 class="rail-heading">Contents</h2>
			<Contents {sections} {activeId} />
		</div>
	</aside>

	<main class="column">
		<Reader {sections} {selected} onselect={select} />
		<Colophon />
	</main>

	<aside class="rail right" class:open={panel === 'apparatus'} aria-label="Marking controls">
		<div class="rail-inner">
			<div class="apparatus-head">
				<span class="label">Marking</span>
				<ThemeToggle />
			</div>
			<Controls />
			<Legend />
			<WordInspector word={selected} onselect={select} onclear={() => (selected = null)} />
		</div>
	</aside>

	{#if panel}
		<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
		<div class="scrim" onclick={() => (panel = null)}></div>
	{/if}
</div>

<style>
	.skip {
		position: absolute;
		left: -9999px;
		top: 0;
		z-index: 10;
		background: var(--ink);
		color: var(--paper);
		padding: 0.5rem 0.9rem;
	}

	.skip:focus {
		left: 0;
	}

	.shell {
		display: grid;
		grid-template-columns: var(--rail-left) minmax(0, 1fr) var(--rail-right);
		gap: 0 3rem;
		max-width: 84rem;
		margin: 0 auto;
		padding: 0 2rem;
		align-items: start;
	}

	.rail.left {
		margin-top: 2rem;
	}

	.rail.right {
		margin-top: -10rem;
	}

	.rail.right .rail-inner {
		padding-top: 2.5rem;
	}

	.rail {
		position: sticky;
		top: 0;
		height: 100vh;
		height: 100dvh;
		display: flex;
		flex-direction: column;
	}

	.rail-inner {
		display: flex;
		flex-direction: column;
		gap: 1.6rem;
		padding: 0 0 2.4rem;
		overflow-y: auto;
		overscroll-behavior: contain;
		scrollbar-width: thin;
	}

	.apparatus-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid var(--ink);
	}

	.column {
		max-width: var(--measure);
		/* Ported from the original: the button hangs below the strip, and the text
		   column is pulled back up under it rather than starting beneath it. The
		   top padding stands in for the default h2 margin the old build relied on
		   to clear the strip. */
		margin: -10rem auto 0;
		padding: 2.5rem 0 6rem;
		display: flex;
		flex-direction: column;
		gap: 3.5rem;
	}

	.rail-heading {
		margin: 0;
		font-size: 2.5rem;
		font-weight: 500;
		line-height: 1;
	}

	/* -- narrow: rails become drawers -- */

	.topbar {
		display: none;
	}

	.scrim {
		display: none;
	}

	@media (max-width: 1180px) {
		.shell {
			grid-template-columns: var(--rail-left) minmax(0, 1fr);
			gap: 0 2.5rem;
		}

		.rail.right {
			margin-top: 0;
			position: fixed;
			top: 0;
			right: 0;
			bottom: 0;
			width: min(20rem, 88vw);
			height: auto;
			background: var(--surface);
			border-left: 1px solid var(--rule);
			z-index: 6;
			transform: translateX(100%);
			transition: transform 180ms ease;
			overflow: hidden;
		}

		.rail.right.open {
			transform: none;
		}

		.rail.right .rail-inner {
			padding: 4.5rem 1.4rem 2rem;
			height: 100%;
		}
	}

	@media (max-width: 900px) {
		.shell {
			grid-template-columns: minmax(0, 1fr);
			padding: 1.5rem 1.25rem 0;
		}

		.topbar {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 1rem;
			position: sticky;
			top: 0;
			z-index: 5;
			margin: 0 -1.25rem;
			padding: 0.55rem 1.25rem;
			background: color-mix(in oklab, var(--paper) 92%, transparent);
			backdrop-filter: blur(8px);
			border-bottom: 1px solid var(--rule);
		}

		.topbar-title {
			font-size: 0.95rem;
			font-weight: 500;
			letter-spacing: 0.02em;
		}

		.tab {
			padding: 0.25rem 0.45rem;
			border: 1px solid var(--rule-strong);
		}

		.tab[aria-expanded='true'] {
			background: var(--ink);
			border-color: var(--ink);
			color: var(--paper);
		}

		.rail.left {
			margin-top: 0;
			position: fixed;
			top: 0;
			left: 0;
			bottom: 0;
			width: min(20rem, 88vw);
			height: auto;
			background: var(--surface);
			border-right: 1px solid var(--rule);
			z-index: 6;
			transform: translateX(-100%);
			transition: transform 180ms ease;
			overflow: hidden;
		}

		.rail.left.open {
			transform: none;
		}

		.rail.left .rail-inner {
			padding: 4.5rem 1.4rem 2rem;
			height: 100%;
		}

		.column {
			margin-top: 0;
			padding: 2rem 0 4rem;
			gap: 2.5rem;
		}

		.scrim {
			display: block;
			position: fixed;
			inset: 0;
			z-index: 5;
			background: rgb(var(--shadow) / 0.35);
		}
	}
</style>
