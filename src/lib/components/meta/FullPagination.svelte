<script lang="ts">
	import type { PaginatedResponse } from "$lib/server/crud";
	import type { Snippet } from "svelte";
	import Pagination from "./Pagination.svelte";

	type Props = {
		pagination: PaginatedResponse<any>;
		children: Snippet;
		key?: string;
	};

	let { pagination, children, key }: Props = $props();

	let keyFull = $derived(key ? `pagination-${key}` : undefined);

	let scrollTarget: HTMLElement | undefined = $state(undefined);
</script>

<div bind:this={scrollTarget}></div>

{#if pagination.totalPages > 0}
	<Pagination
		count={pagination.totalItems}
		perPage={pagination.perPage}
		page={pagination.page}
		persistPerPageKey={keyFull}
	/>
{/if}

{@render children()}

{#if pagination.totalPages > 0}
	<Pagination
		count={pagination.totalItems}
		perPage={pagination.perPage}
		page={pagination.page}
		hidePerPageSelect
		scrollTo={scrollTarget}
	/>
{/if}
