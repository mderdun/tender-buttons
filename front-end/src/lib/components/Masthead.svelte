<!--
	The 1914 cover, reproduced, with the edition's own title set beside it.

	Two things carried over from the original build and kept:

	- The button opts out of the global box-sizing reset. The old build declared
	  Tailwind but shipped no PostCSS config, so no reset ever applied and the
	  disc was laid out content-box: 190px of face plus a 20px rim. Border-box
	  would give a 150px face and break "TENDER BUTTONS" across two lines.
	- The disc hangs below the strip rather than sitting inside it.

	What changed: the four hardcoded colours now come from the tokens, so the
	masthead follows the theme like everything else; the strip is sized from its
	container rather than 100vw, which included the scrollbar gutter; and the disc
	scales instead of being pinned at 230px from 320px up to 1500px.
-->
<script lang="ts">
	import stats from '$lib/data/stats.json';
</script>

<header class="masthead">
	<span class="strip" aria-hidden="true"></span>

	<div class="inner">
		<!--
			The cover as an object. Its lettering repeats the title that follows it,
			so it is hidden from the accessibility tree rather than announced twice —
			and it is no longer a 300-character link to the page you are already on.
		-->
		<div class="cover" aria-hidden="true">
			<div class="face">
				<p>By</p>
				<p>Gertrude Stein</p>
				<p class="cover-title">TENDER BUTTONS</p>
				<p>Objects&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Food</p>
				<p>Rooms</p>
			</div>
		</div>

		<div class="title-block">
			<h1>A Sensory <em>Tender Buttons</em></h1>
			<p class="standfirst">
				Gertrude Stein's <em>Tender Buttons</em> (1914) read against the Lancaster Sensorimotor
				Norms, with each of
				<span class="numeric">{stats.matched.toLocaleString('en')}</span> rated words marked for the sense
				it draws on most strongly.
			</p>
		</div>
	</div>
</header>

<style>
	.masthead {
		position: relative;
		/* The disc hangs past the strip; the overhang is the masthead's height. */
		--disc: clamp(8.5rem, 17vw, 13rem);
		--rim: clamp(0.75rem, 1.5vw, 1.25rem);
		--strip-h: clamp(5.25rem, 10vh, 7rem);
	}

	/* Was width: 100vw, which is wider than the document whenever a classic
	   scrollbar is present and put a horizontal scrollbar on the whole page. */
	.strip {
		position: absolute;
		inset: 0 0 auto 0;
		height: var(--strip-h);
		background: var(--cover);
		z-index: -1;
	}

	.inner {
		max-width: 84rem;
		margin: 0 auto;
		padding: 0 2rem;
		display: flex;
		align-items: flex-start;
		gap: clamp(1.25rem, 3vw, 2.5rem);
	}

	.cover {
		box-sizing: content-box;
		width: var(--disc);
		height: var(--disc);
		border: var(--rim) solid var(--cover);
		border-radius: 100%;
		background: var(--cover-face);
		color: var(--cover);
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		text-align: center;
		flex: none;
	}

	.face {
		font-size: clamp(0.62rem, 1.15vw, 0.94rem);
		font-weight: 700;
		letter-spacing: 0.14em;
		line-height: 1.35;
	}

	.face p {
		margin: 0;
	}

	.cover-title {
		font-weight: 900;
		letter-spacing: 0.11em;
	}

	/* Sits across the strip: the title in paper on ink, the standfirst below it on
	   the page proper. */
	.title-block {
		min-width: 0;
		padding-top: clamp(0.5rem, 1.6vh, 1.1rem);
	}

	h1 {
		margin: 0;
		font-size: clamp(1.9rem, 4.6vw, 3.4rem);
		font-weight: 500;
		line-height: 1.02;
		letter-spacing: -0.018em;
		/* Sits on the cover strip, so it takes the cover's ink in both themes. */
		color: var(--cover-ink);
		text-wrap: balance;
	}

	h1 em {
		font-style: italic;
	}

	.standfirst {
		max-width: 34ch;
		margin: calc(var(--strip-h) * 0.28) 0 0;
		font-size: clamp(0.95rem, 1.35vw, 1.08rem);
		line-height: 1.5;
		color: var(--ink-2);
		text-wrap: pretty;
	}

	.standfirst em {
		font-style: italic;
	}

	@media (max-width: 900px) {
		.masthead {
			--disc: clamp(7rem, 26vw, 9.5rem);
			--rim: clamp(0.6rem, 2.2vw, 0.9rem);
			--strip-h: clamp(3.5rem, 8vh, 5rem);
		}

		.inner {
			padding: 0 1.25rem;
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}

		h1 {
			/* Below the strip once the block stacks, so it takes page ink. */
			color: var(--ink);
			font-size: clamp(1.75rem, 8vw, 2.4rem);
		}

		.title-block {
			padding-top: 0;
		}

		.standfirst {
			margin-top: 0.5rem;
			max-width: none;
		}
	}
</style>
