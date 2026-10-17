<script lang="ts">
	import type { PaginatedResponse } from "#lib/server/crud/index.js";
	import type { Snippet } from "svelte";
	import Pagination from "./Pagination.svelte";

	type Props = {
		pagination: PaginatedResponse<any>;
		children: Snippet;
		perPageOptions: number[];
	};

	let { pagination, children, perPageOptions }: Props = $props();

	let scrollTarget: HTMLElement | undefined = $state(undefined);

	let showPagination = $derived(
		pagination.totalItems > Math.min(...perPageOptions),
	);
</script>

<div bind:this={scrollTarget}></div>

{#if showPagination}
	<Pagination
		count={pagination.totalItems}
		perPage={pagination.perPage}
		page={pagination.page}
		{perPageOptions}
	/>
{/if}

{@render children()}

{#if pagination.totalPages > 1}
	<Pagination
		count={pagination.totalItems}
		perPage={pagination.perPage}
		page={pagination.page}
		scrollTo={scrollTarget}
	/>
{/if}
