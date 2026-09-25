<script lang="ts">
	import { page } from "$app/state";
	import { m } from "$lib/paraglide/messages";
	import { getLocale } from "$lib/paraglide/runtime";
	import type { Quote } from "$lib/server/quotes";
	import { Info } from "@lucide/svelte";
	import { Popover } from "bits-ui";

	let { quotes }: { quotes: Quote[] } = $props();

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

{#if quotes.length === 0}
	<div
		class="rounded-box border border-dashed border-base-300 px-5 py-10 textsearchContent || searchPerson-center"
	>
		<p class="text-base-content/70">
			{searchQueryExists
				? m["group.noMatchingQuotes"]()
				: m["group.noQuotes"]()}
		</p>
	</div>
{:else}
	<ul class="grid gap-4 sm:grid-cols-2">
		{#each quotes as quote (quote.id)}
			<li class="quote-card rounded-box p-4 relative">
				<p
					class="font-display text-[1.05rem] leading-snug text-balance"
				>
					&ldquo;{quote.text}&rdquo;
				</p>

				<p class="mt-3 text-sm text-base-content/60">
					— {quote.person ?? m["group.anonymousPersonDisplay"]()}

					<span class="text-base-content/40">
						· {formatDate(quote.quotedAt)}
					</span>
				</p>

				{#if quote.context}
					<Popover.Root>
						<Popover.Trigger
							class="absolute top-2 right-2 inline-flex size-6 items-center justify-center rounded-full text-muted-foreground hover:bg-base-200 hover:text-base-content"
							aria-label="More information"
						>
							<Info class="size-4" />
						</Popover.Trigger>

						<Popover.Content
							class="z-50 w-64 rounded-lg border bg-base-100 p-4 shadow-lg"
							side="bottom"
							align="end"
							sideOffset={6}
						>
							<p class="text-sm">
								{quote.context}
							</p>

							<Popover.Arrow class="fill-base-100" />
						</Popover.Content>
					</Popover.Root>
				{/if}
			</li>
		{/each}
	</ul>
{/if}

<style lang="scss">
	.quote-card {
		background: color-mix(
			in oklch,
			var(--color-base-100) 100%,
			transparent
		);
		border: 1.5px solid var(--color-base-300);
		transition:
			transform 0.15s ease,
			box-shadow 0.15s ease;
	}

	.quote-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 18px -8px color-mix(in oklch, var(--color-neutral) 35%, transparent);
	}
</style>
