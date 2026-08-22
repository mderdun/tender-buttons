<!--
	The editor's note and the finding, set where an edition puts them: after the
	half-title, before the text.

	The page previously opened straight onto "OBJECTS" with no statement of what
	it was or what it found, and left both to a section titled "Info" 76,000px
	below. The prose here is adapted from the accompanying essay; the figures are
	computed by scripts/build-data.mjs and are not written by hand.
-->
<script lang="ts">
	import stats from '$lib/data/stats.json';
	import { SCHEMES } from '$lib/senses';

	const label = (id: string) => SCHEMES.perceptual.categories.find((c) => c.id === id)?.label ?? id;

	const pct = (n: number) => n.toFixed(1);
	const signed = (n: number) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${Math.abs(n).toFixed(1)}`;

	const top = stats.mostUnidimensional;
	const bottom = stats.mostMultidimensional;

	const names = (list: typeof top) =>
		list.map((p) => p.title.replace(/\.$/, '').toLowerCase()).join(', ');
</script>

<section class="frontmatter" aria-labelledby="note-heading">
	<h2 class="label" id="note-heading">Editor's note</h2>

	<div class="prose">
		<p class="lede">
			<em>Tender Buttons</em> is not difficult by accident. Stein wanted a way of naming things that would
			not invent names, but “mean names without naming them”, and the result resists the kind of reading
			most of us do automatically. If a sentence will not resolve, that is the book working rather than
			the reader failing.
		</p>
		<p>
			So this edition offers the other thing you can do with it: <em>not-reading</em>. Every word
			the Lancaster Sensorimotor Norms rate is underlined for the sense it draws on most strongly,
			which lets the text be looked at as a distribution rather than construed as a statement. Read
			a portrait if you like. You can also just look.
		</p>
	</div>

	<h2 class="label" id="finding-heading">What it shows</h2>

	<div class="prose">
		<p>
			Stein's sensory vocabulary is unremarkable. Measured against all
			<span class="numeric">{stats.lancasterTotal.toLocaleString('en')}</span> rated words in the
			Lancaster norms, every one of the six senses falls within
			<span class="numeric">{pct(stats.maxShareDelta)}</span> percentage points of the share it would
			be expected to take in ordinary English.
		</p>
	</div>

	<table class="finding" aria-describedby="finding-heading">
		<thead>
			<tr>
				<th scope="col" class="cat">Sense</th>
				<th scope="col" class="num">Stein</th>
				<th scope="col" class="num">English</th>
				<th scope="col" class="num">Difference</th>
			</tr>
		</thead>
		<tbody>
			{#each stats.comparison as row (row.id)}
				<tr>
					<th scope="row" class="cat">
						<span class="swatch" data-cat={row.id}></span>
						<span class="name">{label(row.id)}</span>
					</th>
					<td class="num numeric">{pct(row.stein.share)}%</td>
					<td class="num numeric">{pct(row.lancaster.share)}%</td>
					<td class="num numeric delta" class:over={row.shareDelta > 0}>
						{signed(row.shareDelta)}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<div class="prose">
		<p>
			That is not the failure of nerve it might look like. Stein's mission was never to invent a
			language; it was to get at perception before language tidies it. The ordinariness of the
			distribution is the evidence that she did not interfere — this is sensory language as it
			actually falls, not as an avant-garde would arrange it.
		</p>
		<p>
			What does vary is how <em>exclusive</em> each portrait's words are — whether they reach for
			one sense or several at once. The most single-sensed portraits are
			<em>{names(top)}</em>; the most multisensory are <em>{names(bottom)}</em>. Food, which engages
			every sense at once, sits
			<span class="numeric"
				>{Math.abs(
					Math.round(
						((stats.sections.find((s) => s.id === 'food')?.exclusivity ?? 0) -
							(stats.sections.find((s) => s.id === 'objects')?.exclusivity ?? 0)) *
							1000
					) / 10
				)}</span
			> points below Objects on the same measure.
		</p>
	</div>
</section>

<style>
	.frontmatter {
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
		padding-bottom: 2.5rem;
		border-bottom: 1px solid var(--rule);
	}

	.frontmatter :global(.label) {
		margin: 0;
	}

	/* Space above a heading, not below it. */
	#finding-heading {
		margin-top: 1.4rem;
	}

	.prose {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.prose p {
		margin: 0;
		max-width: 68ch;
		font-size: 1.02rem;
		line-height: 1.62;
		color: var(--ink-2);
		text-wrap: pretty;
	}

	.lede {
		font-size: 1.12rem !important;
		color: var(--ink) !important;
	}

	.prose em {
		font-style: italic;
	}

	/* The comparison, set as a table because that is what it is. Ruled rather
	   than boxed, in the manner of the tables in the book it is about. */
	.finding {
		width: 100%;
		max-width: 34rem;
		margin: 0.5rem 0;
		border-collapse: collapse;
		font-size: 0.88rem;
	}

	.finding thead th {
		font-family: var(--sc);
		font-weight: 600;
		font-size: 0.78rem;
		letter-spacing: 0.04em;
		color: var(--graphite);
		padding: 0 0.5rem 0.35rem 0;
		border-bottom: 1px solid var(--ink);
	}

	.finding tbody tr {
		border-bottom: 1px solid var(--rule);
	}

	.finding th.cat {
		display: flex;
		align-items: baseline;
		gap: 0.55rem;
		text-align: left;
		font-weight: 400;
		padding: 0.4rem 0.5rem 0.4rem 0;
	}

	.finding tbody th.cat .name {
		font-family: var(--sc);
		letter-spacing: 0.03em;
		color: var(--ink-2);
	}

	.finding .swatch {
		position: relative;
		top: 0.1em;
	}

	.num {
		text-align: right;
		padding: 0.4rem 0 0.4rem 0.5rem;
		white-space: nowrap;
		color: var(--ink-2);
	}

	thead .num {
		padding-right: 0;
	}

	/* Direction is stated by the sign, so colour is not carrying it alone. */
	.delta {
		color: var(--graphite);
	}

	@media (max-width: 560px) {
		.finding {
			font-size: 0.82rem;
		}

		.finding th.cat {
			gap: 0.4rem;
		}
	}
</style>
