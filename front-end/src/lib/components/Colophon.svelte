<script lang="ts">
	import stats from '$lib/data/stats.json';
</script>

<section class="colophon" id="about" aria-labelledby="about-heading">
	<h2 id="about-heading">Info</h2>

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
		and sets the weight of the underline.
	</p>
	<p>
		Of <span class="numeric">{stats.tokens.toLocaleString('en')}</span> words in the text,
		<span class="numeric">{stats.matched.toLocaleString('en')}</span> are marked, drawing on a
		vocabulary of <span class="numeric">{stats.vocabulary.toLocaleString('en')}</span> rated words.
		The <span class="numeric">{stats.unmatchedTypes}</span> distinct words left unmarked are almost
		all function words, deliberately excluded. A handful are Stein's own &mdash;
		<em>excreate</em>, <em>knealer</em>, <em>cocups</em> &mdash; which no norm set can rate.
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
		margin: 1.2rem 0 -0.2rem;
		font-family: var(--mono);
		font-size: 0.68rem;
		font-weight: 500;
		letter-spacing: 0.13em;
		text-transform: uppercase;
		color: var(--graphite);
	}

	p {
		margin: 0;
		font-size: 0.95rem;
		line-height: 1.65;
		color: var(--ink-2);
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
