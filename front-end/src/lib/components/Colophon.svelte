<script lang="ts">
	import stats from '$lib/data/stats.json';
</script>

<section class="colophon" id="colophon" aria-labelledby="colophon-heading">
	<h2 id="colophon-heading">Colophon</h2>

	<p>
		This is Gertrude Stein's <em>Tender Buttons</em> (1914) read against the
		<a href="https://doi.org/10.3758/s13428-019-01316-z">Lancaster Sensorimotor Norms</a>, a set of
		ratings for 40,000 English words across eleven dimensions of perception and action. It began as
		a companion to an essay for the Nonsense Literature module at Durham University.
	</p>

	<h3>How the marking works</h3>
	<p>
		Stein's text was stripped of punctuation and capitalisation to produce a word list, common
		function words were removed, and the remainder was matched against the Lancaster norms. Each
		matched word carries a rating on all eleven dimensions. The <em>dominant</em> category is
		whichever scored highest; <em>exclusivity</em> measures how far that one category leads the others,
		and sets the weight of the underline — a word that reaches for a single sense is ruled more heavily
		than one that reaches for several.
	</p>
	<p>
		Category is carried by colour <em>and</em> by the shape of the rule — solid, double, dotted, dashed,
		dot-dash, hatched — so the distinction survives greyscale and colour-vision deficiency. Marks are
		underlines rather than highlights, which leaves Stein's text at full contrast.
	</p>
	<p>
		Of <span class="numeric">{stats.tokens.toLocaleString('en')}</span> words in the text,
		<span class="numeric">{stats.matched.toLocaleString('en')}</span> are marked, drawing on a
		vocabulary of <span class="numeric">{stats.vocabulary.toLocaleString('en')}</span> rated words.
		The <span class="numeric">{stats.unmatchedTypes}</span> distinct words left unmarked are almost
		all function words, deliberately excluded. A handful are Stein's own &mdash;
		<em>excreate</em>, <em>knealer</em>, <em>cocups</em> &mdash; which no norm set can rate.
	</p>

	<h3>Limits</h3>
	<p>
		The norms rate words in isolation, so nothing here accounts for how Stein modifies one word with
		another. Cross-modal construction is exactly where a writer would bend sensory language if she
		were going to, and this method cannot see it. The distributions below the marking are a floor on
		the argument, not the whole of it.
	</p>

	<h3>How to cite</h3>
	<!--
		TODO(author): the accompanying essay was submitted anonymously under a
		candidate number, so no name is asserted here. Replace the bracket with a
		name, or delete it and cite the edition by title.
	-->
	<p class="cite">
		[Author], <em>A Sensory Tender Buttons</em> (2024) &lt;https://tender-buttons.vercel.app/&gt;
	</p>

	<h3>Sources</h3>
	<ul>
		<li>
			Text from the
			<a href="https://www.gutenberg.org/ebooks/15396">Project Gutenberg edition</a>, produced by
			Suzanne Shell, Josephine Paolucci and the Online Distributed Proofreading Team. Public domain,
			under the terms of the Project Gutenberg License.
		</li>
		<li>
			Dermot Lynott and others, &lsquo;The Lancaster Sensorimotor Norms: Multidimensional Measures
			of Perceptual and Action Strength for 40,000 English Words&rsquo;,
			<em>Behavior Research Methods</em>, 52.3 (2020), 1271&ndash;91,
			<a href="https://doi.org/10.3758/s13428-019-01316-z">doi:10.3758/s13428-019-01316-z</a>.
		</li>
		<li>
			The baseline distribution the marking is compared against is taken from the accompanying
			essay, which derived it from the full norm set; the sibling data directory holds only the
			<em>Tender Buttons</em> subset.
		</li>
	</ul>
</section>

<style>
	.colophon {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding-top: 2.5rem;
		border-top: 1px solid var(--ink);
		scroll-margin-top: 5rem;
	}

	h2 {
		margin: 0 0 0.4rem;
		font-size: 1.5rem;
		font-weight: 400;
	}

	h3 {
		/* More space above a heading than below it. */
		margin: 1.4rem 0 -0.1rem;
		font-family: var(--sc);
		font-size: 0.82rem;
		font-weight: 600;
		letter-spacing: 0.05em;
		color: var(--graphite);
	}

	p {
		margin: 0;
		font-size: 0.95rem;
		line-height: 1.65;
		color: var(--ink-2);
		text-wrap: pretty;
	}

	.cite {
		padding-left: 1.6rem;
		text-indent: -1.6rem;
		font-size: 0.9rem;
	}

	ul {
		margin: 0;
		padding-left: 1.1rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		font-size: 0.88rem;
		line-height: 1.55;
		color: var(--ink-2);
	}

	.numeric {
		color: var(--ink);
	}

	/* Links are undecorated globally, as in the original; in running prose they
	   still need to be identifiable as links. */
	.colophon a {
		text-decoration: underline;
		text-decoration-color: var(--rule-strong);
		text-underline-offset: 2px;
	}

	.colophon a:hover {
		text-decoration-color: currentColor;
	}
</style>
