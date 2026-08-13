<script lang="ts">
	import { isWord, type Segment } from '$lib/types';

	let { segments }: { segments: Segment[] } = $props();
</script>

<!-- prettier-ignore -->
{#each segments as segment, i (i)}{#if isWord(segment)}<span
			class="w"
			data-p={segment.p}
			data-a={segment.a}
			data-pl={segment.pl}
			data-al={segment.al}>{segment.w}</span>{:else}{segment.t}{/if}{/each}
