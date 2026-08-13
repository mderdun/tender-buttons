// The edition is a fixed text with no server behaviour: prerender everything and
// skip the client-side router, which has nothing to route.
export const prerender = true;
export const ssr = true;
