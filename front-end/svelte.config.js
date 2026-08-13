import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		// The edition is a fixed text with no server behaviour, so the whole site
		// prerenders to flat files. The annotation layer is baked into that HTML.
		adapter: adapter({ fallback: undefined, strict: true }),
		prerender: { entries: ['*'] },
		paths: { relative: true }
	}
};

export default config;
