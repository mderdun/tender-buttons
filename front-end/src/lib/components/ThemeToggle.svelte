<script lang="ts">
	import { browser } from '$app/environment';

	type Theme = 'system' | 'light' | 'dark';

	const ORDER: Theme[] = ['system', 'light', 'dark'];
	const LABELS: Record<Theme, string> = { system: 'Auto', light: 'Light', dark: 'Dark' };

	// The same key the inline script in app.html reads before first paint.
	let theme = $state<Theme>(
		browser ? ((localStorage.getItem('tender-buttons:theme') as Theme) ?? 'system') : 'system'
	);

	function cycle() {
		theme = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];
		if (theme === 'system') {
			document.documentElement.removeAttribute('data-theme');
			localStorage.removeItem('tender-buttons:theme');
		} else {
			document.documentElement.setAttribute('data-theme', theme);
			localStorage.setItem('tender-buttons:theme', theme);
		}
	}
</script>

<button
	class="theme label"
	onclick={cycle}
	aria-label="Colour theme: {LABELS[theme]}. Click to change."
>
	{LABELS[theme]}
</button>

<style>
	.theme {
		padding: 0.2rem 0.4rem;
		border: 1px solid var(--rule-strong);
		color: var(--graphite);
	}

	.theme:hover {
		color: var(--ink);
		border-color: var(--ink);
	}
</style>
