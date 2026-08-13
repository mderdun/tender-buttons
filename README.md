# Tender Buttons — a sensorimotor edition

Gertrude Stein's _Tender Buttons_ (1914) read against the
[Lancaster Sensorimotor Norms][norms], with every rated word marked for the sense it
draws on most strongly.

Two research questions drive it:

- How does Stein use sensorimotor language?
- Does she use the senses you would expect for the things she describes?

## Layout

```
data/        the pipeline that produced the word list — notebooks, source texts, CSVs
front-end/   the SvelteKit site
```

`data/` is the archive of how the word list was built: the Gutenberg text split into
`list.csv`, tokenised into `words.csv`, and joined against the Lancaster norms to give
`words_with_sm_norms.csv`. Those three CSVs are the inputs the site is built from.

## Running the site

```sh
cd front-end
npm install
npm run dev
```

Other scripts:

| Command          | What it does                                            |
| ---------------- | ------------------------------------------------------- |
| `npm run data`   | Regenerates the annotation data from `../data`          |
| `npm run build`  | Prerenders the whole site to `build/`                   |
| `npm run check`  | Type-checks with `svelte-check`                         |
| `npm run lint`   | Prettier and ESLint                                     |
| `npm test`       | Data and coverage tests                                 |

## How the annotation works

The join between Stein's text and the norms happens once, at build time, in
`front-end/scripts/build-data.mjs`. It tokenises every portrait, reduces each token
the same way the original word list was built (lowercase, strip everything
non-alphanumeric), looks it up, and writes three files into `src/lib/data`:

| File             | Purpose                                                          |
| ---------------- | ---------------------------------------------------------------- |
| `portraits.json` | the text, pre-tokenised, each word carrying its dominant category |
| `norms.json`     | the full 11-dimension table, fetched only when a word is opened   |
| `stats.json`     | corpus counts, used by the page and asserted by the tests         |

Those outputs are committed, so a build never needs `../data` present. CI regenerates
them and fails if they have drifted from the source CSVs.

The site then prerenders to flat HTML with the marking already in place — 6,624
`<span class="w">` elements, each carrying its two dominance categories and two
intensity bands as attributes. Every appearance decision after that is made in CSS
from those attributes, so switching between the sense and body schemes, hiding a
category, changing strength or turning annotation off restyles the page without
re-rendering a single node.

### Colour is never the only channel

Each category has both a colour and an underline texture — solid, double, dotted,
dashed, dot-dash, hatched — so the distinction survives colour-vision deficiency and
greyscale. Marks are underlines rather than highlights, which leaves the text at full
contrast.

### Accessibility note

The 6,624 marked words are deliberately **not** individually focusable: putting each
in the tab order would make the page unusable with a keyboard, and wrapping each in
`<mark>` would make a screen reader announce a highlight boundary several thousand
times. The word search in the apparatus panel is the keyboard and screen-reader route
to the same data, and annotation can be switched off entirely.

## Coverage

Of 14,901 words in the text, 6,624 are marked, drawing on a vocabulary of 2,502 rated
words. The 109 distinct words left unmarked are almost all function words, removed
deliberately when the word list was built. A handful are Stein's own — _excreate_,
_knealer_, _cocups_ — which no norm set can rate. `npm test` asserts these numbers, so
a change to the tokeniser or the source data fails the build rather than quietly
losing words.

## Open

- **Licence.** The repository has no licence file. The code needs one; the Lancaster
  norms have their own redistribution terms, which are worth confirming before the
  derived CSV ships as a public asset.
- **The essay** this accompanies is not published here.
- **Not yet built:** the portrait-level comparison of title against description, the
  charts for the Data section, and the concordance that `appears_in` already supports.

## Sources

Text from the [Project Gutenberg edition][gutenberg], produced by Suzanne Shell,
Josephine Paolucci and the Online Distributed Proofreading Team. Public domain, under
the terms of the Project Gutenberg License.

Dermot Lynott and others, 'The Lancaster Sensorimotor Norms: Multidimensional Measures
of Perceptual and Action Strength for 40,000 English Words', _Behavior Research
Methods_, 52.3 (2020), 1271–91, [doi:10.3758/s13428-019-01316-z][norms].

[norms]: https://doi.org/10.3758/s13428-019-01316-z
[gutenberg]: https://www.gutenberg.org/ebooks/15396
