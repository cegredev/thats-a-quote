<script lang="ts">
	import { page } from "$app/state";
	import { m } from "#lib/paraglide/messages.js";
	import FullPagination from "#lib/components/meta/FullPagination.svelte";
	import Quote from "./Quote.svelte";
	import { Info, Pencil } from "@lucide/svelte";
	import type { GroupQuotesPagination } from "#lib/server/queries/quotes.ts";
	import { addQueryParamToHref } from "#lib/client/component-utils.svelte.ts";

	let {
		quotes,
	}: {
		quotes: GroupQuotesPagination;
	} = $props();

	let searchQueryExists = $derived(page.url.searchParams.size > 0);
</script>

{#if quotes.pagination.total === 0}
	<div class="rounded-lg border border-dashed px-5 py-10 text-center">
		<p class="text-muted-foreground">
			{searchQueryExists
				? m.group_noMatchingQuotes()
				: m.group_noQuotes()}
		</p>
	</div>
{:else}
	<FullPagination
		pagination={quotes.pagination}
		perPageOptions={[10, 30, 50, 80, 100]}
	>
		<ul class="grid gap-4 sm:grid-cols-2">
			{#each quotes.data as quote (quote.id)}
				<li>
					<Quote {quote}>
						{#snippet bottomRight()}
							<div class="flex items-center gap-2">
								<a
									href={addQueryParamToHref(
										page.url.href,
										"edit",
										quote.id,
									)}
									aria-label={m.edit_quote()}
									title={m.edit_quote()}
								>
									<Pencil class="size-4" />
								</a>
							</div>
						{/snippet}
					</Quote>
				</li>
			{/each}
		</ul>
	</FullPagination>
{/if}
