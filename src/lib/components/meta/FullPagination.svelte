<script lang="ts">
	import type { Snippet } from "svelte";
	import Pagination from "./Pagination.svelte";
	import type { BetterPagination } from "#lib/types.ts";

	type Props = {
		pagination: BetterPagination;
		children: Snippet;
		perPageOptions: number[];
	};

	let { pagination, children, perPageOptions }: Props = $props();

	let scrollTarget: HTMLElement | undefined = $state(undefined);

	let showPagination = $derived(
		pagination.total > Math.min(...perPageOptions),
	);
</script>

<div bind:this={scrollTarget}></div>

{#if showPagination}
	<Pagination
		count={pagination.total}
		perPage={pagination.perPage}
		page={pagination.page}
		{perPageOptions}
	/>
{/if}

{@render children()}

{#if pagination.total > 1}
	<Pagination
		count={pagination.total}
		perPage={pagination.perPage}
		page={pagination.page}
		scrollTo={scrollTarget}
	/>
{/if}
