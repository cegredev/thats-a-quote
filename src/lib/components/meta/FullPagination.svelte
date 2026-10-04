<script lang="ts">
	import type { PaginatedResponse } from "$lib/server/crud";
	import type { Snippet } from "svelte";
	import Pagination from "./Pagination.svelte";

	type Props = {
		pagination: PaginatedResponse<any>;
		children: Snippet;
	};

	let { pagination, children }: Props = $props();

	let scrollTarget: HTMLElement | undefined = $state(undefined);

	const perPageOptions = [10, 30, 50, 80, 100];

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
