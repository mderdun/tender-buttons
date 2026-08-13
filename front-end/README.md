# front-end

The SvelteKit site. See the [repository README](../README.md) for what the project is
and how the annotation pipeline works.

```sh
npm install
npm run dev
```

## Stack

SvelteKit 2 on Svelte 5 (runes), TypeScript, `adapter-static`. No CSS framework — the
design system is a set of custom properties in `src/app.css`.

## Shape of the code

```
scripts/build-data.mjs      build-time join of the text against the norms
src/lib/data/*.json         its committed output
src/lib/senses.ts           category names and ordering
src/lib/settings.svelte.ts  reader settings, as runes
src/lib/norms.ts            lazy loader for the full norm table
src/lib/components/         Reader, Portrait, Segments, and the apparatus panel
src/app.css                 tokens, typography, and the whole annotation mark system
```

`src/app.css` is where the annotation is actually implemented. The markup only sets
`data-p`, `data-a`, `data-pl` and `data-al` on each word; every colour, texture and
intensity decision is resolved from those in CSS.

One detail worth knowing before editing the mark styles: the texture gradients are
declared on `.w, .swatch` rather than on an ancestor because a `var()` inside a custom
property is resolved when that property is computed on the element declaring it. A
gradient referring to `--mark` is only valid where `--mark` exists; declared higher up
it computes to guaranteed-invalid and inherits down as nothing at all.
