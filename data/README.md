# data

How the word list was built. These files are the inputs the site is generated from —
see the [repository README](../README.md) for the project as a whole.

## Files

| File                        | What it is                                                            |
| --------------------------- | --------------------------------------------------------------------- |
| `text-variants/`            | The Gutenberg text, split into Objects, Food and Rooms                |
| `parser.ipynb`              | Splits the text into portraits, then into a cleaned word list         |
| `list.csv`                  | 110 portraits: category, title, text                                  |
| `words.csv`                 | Every content word, with the portraits it appears in                  |
| `word_edit.txt`             | Manual pass reconciling variants against the norms                    |
| `sensorimotor_norms.csv`    | The subset of the Lancaster norms covering this vocabulary            |
| `words_with_sm_norms.csv`   | `words.csv` joined to the norms — 2,506 rows, 17 columns              |
| `graphs.ipynb`              | Exploratory Plotly figures (not yet ported to the site)               |
| `steinHTML.py`, `output.html` | An earlier route from `list.csv` to markup, superseded by the site's build step |

`list.csv` and `words_with_sm_norms.csv` are the two files the site actually reads;
`front-end/scripts/build-data.mjs` joins them at build time.

## Method

- Split the text into portraits, keyed by their all-caps titles. Repeated titles are
  disambiguated with a `[2]` suffix.
- Lowercase, expand contractions, strip punctuation, tokenise, drop stopwords.
- Look each remaining word up in the Lancaster norms. Words absent from the norms were
  almost all variants of words that were present (tense, plurality, British/American
  spelling); those were reconciled by hand in `word_edit.txt`. Words too distinct to
  match were left out.

## Known defects

`words_with_sm_norms.csv` contains three bare numerals (`2`, `3`, `4`) that survived
tokenisation, and a duplicated row for `sack`. The build step drops both and reports
what it dropped, rather than editing the archive.

A few real words are missing from the derived subset — `letters` is the clearest case.
They cannot be recovered from `sensorimotor_norms.csv`, which is already narrowed to
this vocabulary; recovering them means going back to the full 40,000-word release.

## Reference

Dermot Lynott and others, 'The Lancaster Sensorimotor Norms: Multidimensional Measures
of Perceptual and Action Strength for 40,000 English Words', _Behavior Research
Methods_, 52.3 (2020), 1271–91,
<https://doi.org/10.3758/s13428-019-01316-z>.
