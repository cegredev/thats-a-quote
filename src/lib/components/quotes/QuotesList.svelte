<script lang="ts">
	import { page } from "$app/state";
	import { m } from "#lib/paraglide/messages.js";
	import type { PaginatedResponse } from "#lib/server/crud/index.js";
	import FullPagination from "#lib/components/meta/FullPagination.svelte";
	import Quote from "./Quote.svelte";
	import type { Quote as QuoteType } from "#lib/zod-schemas.ts";

	let { pagination }: { pagination: PaginatedResponse<QuoteType> } = $props();

	let searchQueryExists = $derived(page.url.searchParams.size > 0);
</script>

{#if pagination.totalItems === 0}
	<div class="rounded-lg border border-dashed px-5 py-10 text-center">
		<p class="text-muted-foreground">
			{searchQueryExists
				? m.group_noMatchingQuotes()
				: m.group_noQuotes()}
		</p>
	</div>
{:else}
	<FullPagination {pagination} perPageOptions={[10, 30, 50, 80, 100]}>
		<ul class="grid gap-4 sm:grid-cols-2">
			{#each pagination.results as quote (quote.id)}
				<li>
					<Quote {quote} />
				</li>
			{/each}
		</ul>
	</FullPagination>
{/if}
