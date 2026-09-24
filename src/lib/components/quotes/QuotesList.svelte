<script lang="ts">
	import { page } from "$app/state";
	import { m } from "$lib/paraglide/messages";
	import { getLocale } from "$lib/paraglide/runtime";
	import type { Quote } from "$lib/server/quotes";

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
			<li class="quote-card rounded-box p-4">
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
			</li>
		{/each}
	</ul>
{/if}
