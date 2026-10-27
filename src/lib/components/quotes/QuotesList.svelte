<script lang="ts">
	import { page } from "$app/state";
	import { m } from "#lib/paraglide/messages.js";
	import FullPagination from "#lib/components/meta/FullPagination.svelte";
	import Quote from "./Quote.svelte";
	import { Pencil } from "@lucide/svelte";
	import type { GroupQuotesPagination } from "#lib/server/queries/quotes.ts";
	import { gotoDrawer } from "#lib/client/drawers.svelte.ts";
	import Button from "#lib/shadcn/components/ui/button/button.svelte";

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
		// perPageOptions={[5, 10, 30, 50, 80, 100]}
	>
		<ul class="grid gap-4 sm:grid-cols-2">
			{#each quotes.data as quote (quote.id)}
				<li>
					<Quote {quote}>
						{#snippet bottomRight()}
							<Button
								onclick={() =>
									gotoDrawer("edit-quote", {
										id: quote.id,
									})}
								variant="ghost"
								size="icon-sm"
								aria-label={m.edit_quote()}
								title={m.edit_quote()}
							>
								<Pencil class="size-4" />
							</Button>
						{/snippet}
					</Quote>
				</li>
			{/each}
		</ul>
	</FullPagination>
{/if}
