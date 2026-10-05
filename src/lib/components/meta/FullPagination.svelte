<script lang="ts">
	import type { PaginatedResponse } from "$lib/server/crud";
	import type { Snippet } from "svelte";
	import Pagination from "./Pagination.svelte";

	type Props = {
		pagination: PaginatedResponse<any>;
		children: Snippet;
		perPageOptions: number[];
		defaultPerPage: number;
	};

	let { pagination, children, perPageOptions, defaultPerPage }: Props =
		$props();

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
		perPageDefault={defaultPerPage}
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
