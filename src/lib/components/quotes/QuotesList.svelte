<script lang="ts" module>
	export const QUOTES_DEFAULT_PAGE_SIZE = 30;
</script>

<script lang="ts">
	import { page } from "$app/state";
	import { m } from "#lib/paraglide/messages.js";
	import { getLocale } from "#lib/paraglide/runtime.js";
	import { CircleQuestionMark } from "@lucide/svelte";
	import GeneralTooltip from "../GeneralTooltip.svelte";
	import type { Quote } from "#lib/zod-schemas.js";
	import type { PaginatedResponse } from "#lib/server/crud/index.js";
	import FullPagination from "#lib/components/meta/FullPagination.svelte";
	import * as Card from "#lib/components_shadcn/ui/card/index.js";

	let { pagination }: { pagination: PaginatedResponse<Quote> } = $props();

	function formatDate(ts: number): string {
		return new Date(ts).toLocaleString(
			getLocale() === "de" ? "de-DE" : "en-US",
			{
				month: "short",
				day: "numeric",
				year: "numeric",
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
			},
		);
	}

	let searchQueryExists = $derived(page.url.searchParams.size > 0);
</script>

{#if pagination.totalItems === 0}
	<div class="rounded-lg border border-dashed px-5 py-10 text-center">
		<p class="text-muted-foreground">
			{searchQueryExists
				? m["group.noMatchingQuotes"]()
				: m["group.noQuotes"]()}
		</p>
	</div>
{:else}
	<FullPagination
		{pagination}
		perPageOptions={[10, 30, 50, 80, 100]}
		defaultPerPage={QUOTES_DEFAULT_PAGE_SIZE}
	>
		<ul class="grid gap-4 sm:grid-cols-2">
			{#each pagination.results as quote (quote.id)}
				<li>
					<Card.Root class="quote-card relative rounded-lg p-4">
						<p
							class="font-display text-[1.05rem] leading-snug text-balance"
						>
							&ldquo;{quote.text}&rdquo;
						</p>

						<p class="mt-3 text-sm text-muted-foreground">
							— {quote.person ?? m["group.anonymousPersonDisplay"]()}

							<span class="text-muted-foreground/65">
								· {formatDate(quote.quotedAt)}
							</span>
						</p>

						{#if quote.context}
							<div class="absolute top-2 right-2">
								<GeneralTooltip>
									{#snippet trigger()}
										<CircleQuestionMark class="size-4" />
									{/snippet}
									{#snippet content()}
										<p class="max-w-64 text-sm">
											{quote.context}
										</p>
									{/snippet}
								</GeneralTooltip>
							</div>
						{/if}
					</Card.Root>
				</li>
			{/each}
		</ul>
	</FullPagination>
{/if}

<style lang="scss">
	:global(.quote-card) {
		background: var(--card);
		border: 1.5px solid var(--border);
		transition:
			transform 0.15s ease,
			box-shadow 0.15s ease;
	}

	:global(.quote-card:hover) {
		transform: translateY(-2px);
		box-shadow: 0 6px 18px -8px color-mix(in oklch, var(--foreground) 35%, transparent);
	}
</style>
