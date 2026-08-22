<script lang="ts">
	import Colophon from '$lib/components/Colophon.svelte';
	import Contents from '$lib/components/Contents.svelte';
	import Controls from '$lib/components/Controls.svelte';
	import Frontmatter from '$lib/components/Frontmatter.svelte';
	import Legend from '$lib/components/Legend.svelte';
	import Masthead from '$lib/components/Masthead.svelte';
	import Reader from '$lib/components/Reader.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import WordInspector from '$lib/components/WordInspector.svelte';
	import { tick } from 'svelte';
	import { settings } from '$lib/settings.svelte';
	import packed from '$lib/data/portraits.json';
	import { decodeCorpus, type PackedCorpus } from '$lib/corpus';

	const { sections } = decodeCorpus(packed as PackedCorpus);

	let selected = $state<string | null>(null);
	let activeId = $state<string | null>(null);
	let panel = $state<'contents' | 'apparatus' | null>(null);

	// Which rails are behaving as drawers at the current width. The rails are
	// ordinary columns above these widths, so nothing may be made inert there.
	let drawerLeft = $state(false);
	let drawerRight = $state(false);

	let contentsTab = $state<HTMLButtonElement | null>(null);
	let apparatusTab = $state<HTMLButtonElement | null>(null);
	let leftRail = $state<HTMLElement | null>(null);
	let rightRail = $state<HTMLElement | null>(null);

	/**
	 * A closed drawer is only moved off-screen by a transform, so without `inert`
	 * its contents stay in the tab order and in the accessibility tree: 114
	 * controls in the contents rail and 11 in the apparatus, all invisible.
	 */
	let leftInert = $derived(drawerLeft && panel !== 'contents');
	let rightInert = $derived(drawerRight && panel !== 'apparatus');

	$effect(() => {
		const left = window.matchMedia('(max-width: 900px)');
		const right = window.matchMedia('(max-width: 1180px)');
		const sync = () => {
			drawerLeft = left.matches;
			drawerRight = right.matches;
			// A drawer that stops being a drawer must not leave a panel latched open.
			if (!left.matches && panel === 'contents') panel = null;
			if (!right.matches && panel === 'apparatus') panel = null;
		};
		sync();
		left.addEventListener('change', sync);
		right.addEventListener('change', sync);
		return () => {
			left.removeEventListener('change', sync);
			right.removeEventListener('change', sync);
		};
	});

	// Scroll-spy: whichever portrait most recently crossed the top third of the
	// viewport is the one the contents list marks as current.
	$effect(() => {
		const portraits = document.querySelectorAll<HTMLElement>('article.portrait');
		const visible: Record<string, boolean> = {};

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) visible[entry.target.id] = entry.isIntersecting;
				let current: string | null = null;
				for (const portrait of portraits) {
					if (visible[portrait.id]) {
						current = portrait.id;
						break;
					}
				}
				// Assigned unconditionally: the old loop only ever set a value, so
				// once the band emptied — between portraits, or above the first one —
				// the marker stayed on whatever it had last seen.
				activeId = current;
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

	async function openPanel(which: 'contents' | 'apparatus') {
		panel = which;
		await tick();
		const rail = which === 'contents' ? leftRail : rightRail;
		rail?.querySelector<HTMLElement>('.rail-inner')?.focus();
	}

	function closePanel() {
		const returnTo = panel === 'contents' ? contentsTab : apparatusTab;
		panel = null;
		returnTo?.focus();
	}

	function togglePanel(which: 'contents' | 'apparatus') {
		if (panel === which) closePanel();
		else openPanel(which);
	}

	async function select(word: string) {
		selected = word;
		if (!drawerRight) return;
		// On a phone the record is the last thing in a tall drawer, so opening the
		// apparatus and stopping there looks like the tap did nothing but summon a
		// settings panel. Take the reader to the record it asked for.
		panel = 'apparatus';
		// tick(), not requestAnimationFrame: rAF is suspended in a backgrounded or
		// occluded tab, which would leave the reader looking at the top of a settings
		// panel with the record they asked for somewhere below the fold.
		await tick();
		const record = rightRail?.querySelector<HTMLElement>('.record');
		record?.scrollIntoView({ block: 'start' });
		record?.focus();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key !== 'Escape') return;
		if (panel) closePanel();
		else selected = null;
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<svelte:head>
	<title>A Sensory Tender Buttons</title>
</svelte:head>

<div class="skips">
	<a class="skip" href="#objects">Skip to the text</a>
	<a class="skip" href="#marking">Skip to the marking</a>
</div>

<Masthead />

<div class="shell" class:panel-open={panel !== null}>
	<div class="topbar">
		<button
			class="tab"
			bind:this={contentsTab}
			aria-expanded={panel === 'contents'}
			aria-controls="contents-rail"
			onclick={() => togglePanel('contents')}
		>
			Contents
		</button>
		<span class="topbar-title">Tender Buttons</span>
		<button
			class="tab"
			bind:this={apparatusTab}
			aria-expanded={panel === 'apparatus'}
			aria-controls="apparatus-rail"
			onclick={() => togglePanel('apparatus')}
		>
			{selected ? selected.toLowerCase() : 'Marking'}
		</button>
	</div>

	<aside
		class="rail left"
		id="contents-rail"
		bind:this={leftRail}
		class:open={panel === 'contents'}
		inert={leftInert}
		aria-label="Contents"
	>
		<div class="rail-inner" tabindex="-1">
			<h2 class="rail-heading">Contents</h2>
			<Contents {sections} {activeId} />
		</div>
	</aside>

	<!--
		Before <main> in source order: the apparatus is the edition's argument, and
		front matter precedes the text it annotates. Grid placement below keeps it
		in the right-hand column visually.
	-->
	<aside
		class="rail right"
		id="apparatus-rail"
		bind:this={rightRail}
		class:open={panel === 'apparatus'}
		inert={rightInert}
		aria-label="Marking"
	>
		<div class="rail-inner" tabindex="-1">
			<div class="apparatus-head">
				<span class="label" id="marking">Marking</span>
				<ThemeToggle />
			</div>
			<Controls />
			<Legend />
			<WordInspector word={selected} onselect={select} onclear={() => (selected = null)} />
			<a class="to-colophon" href="#colophon">How the marking works</a>
		</div>
	</aside>

	<main class="column">
		<Frontmatter />
		<Reader {sections} {selected} onselect={select} />
		<Colophon />
	</main>

	{#if panel}
		<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
		<div class="scrim" onclick={closePanel}></div>
	{/if}
</div>

<style>
	.skips {
		position: absolute;
		top: 0;
		left: 0;
		z-index: 10;
	}

	.skip {
		position: absolute;
		left: -9999px;
		top: 0;
		background: var(--ink);
		color: var(--paper);
		padding: 0.5rem 0.9rem;
		white-space: nowrap;
	}

	.skip:focus {
		left: 0;
	}

	.skip:nth-child(2):focus {
		left: 11rem;
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

	/* Explicit placement, so source order and visual order can differ. */
	.rail.left {
		grid-column: 1;
		grid-row: 1;
		margin-top: 2rem;
	}

	.column {
		grid-column: 2;
		grid-row: 1;
	}

	.rail.right {
		grid-column: 3;
		grid-row: 1;
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
		gap: 1.5rem;
		padding: 0 0 2.4rem;
		overflow-y: auto;
		overscroll-behavior: contain;
		scrollbar-width: thin;
	}

	.rail-inner:focus {
		outline: none;
	}

	.rail-inner:focus-visible {
		outline: 2px solid var(--ink);
		outline-offset: -2px;
	}

	.apparatus-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid var(--ink);
	}

	.to-colophon {
		font-size: 0.82rem;
		color: var(--graphite);
		text-decoration: underline;
		text-decoration-color: var(--rule-strong);
		text-underline-offset: 3px;
		padding: 0.3rem 0;
	}

	.to-colophon:hover {
		color: var(--ink);
		text-decoration-color: currentColor;
	}

	.column {
		max-width: var(--measure);
		margin: 2.5rem auto 0;
		padding: 0 0 6rem;
		display: flex;
		flex-direction: column;
		gap: 3.5rem;
	}

	.rail-heading {
		margin: 0;
		font-family: var(--sc);
		font-size: 1.9rem;
		font-weight: 500;
		line-height: 1;
		letter-spacing: 0.01em;
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
			grid-column: 2;
			position: fixed;
			top: 0;
			right: 0;
			bottom: 0;
			left: auto;
			width: min(22rem, 90vw);
			height: auto;
			background: var(--surface);
			border-left: 1px solid var(--rule);
			z-index: 6;
			transform: translateX(100%);
			transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
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

		.rail.left,
		.rail.right,
		.column {
			grid-column: 1;
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
			grid-row: 1;
		}

		.rail.left {
			grid-row: 2;
		}

		.rail.right {
			grid-row: 2;
		}

		.column {
			grid-row: 2;
		}

		.topbar-title {
			font-size: 0.95rem;
			font-weight: 500;
			letter-spacing: 0.02em;
		}

		.tab {
			font-family: var(--sc);
			font-size: 0.82rem;
			letter-spacing: 0.04em;
			color: var(--graphite);
			padding: 0.3rem 0.5rem;
			border: 1px solid var(--rule-strong);
			max-width: 9rem;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
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
			transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
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

	/* The drawer's arrival is a state change, so it is substituted rather than
	   deleted: it appears in place instead of sliding. */
	@media (prefers-reduced-motion: reduce) {
		.rail.left,
		.rail.right {
			transition: none;
		}
	}
</style>
