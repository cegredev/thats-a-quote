<script lang="ts">
	import * as Card from "#lib/shadcn/components/ui/card/index.js";
	import { m } from "#lib/paraglide/messages.js";
	import { SquareText } from "@lucide/svelte";
	import GeneralTooltip from "../GeneralTooltip.svelte";
	import { getLocale } from "#lib/paraglide/runtime.js";
	import { cn } from "cn";
	import type { Snippet } from "svelte";
	import type { QuoteWithRest } from "#lib/server/queries/quotes.ts";
	import EmojiPickerPopoverForm from "../emojis/EmojiPickerPopoverForm.svelte";
	import { authClient } from "#lib/client/frontend-auth.ts";

	let {
		quote,
		bottomRight,
	}: {
		quote: QuoteWithRest;
		bottomRight?: Snippet;
	} = $props();

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

	let reactionCounts = $derived(
		new Map(
			Object.entries(
				quote.reactions.reduce(
					(previous, current) => {
						previous[current.content] ??= 0;
						previous[current.content]++;

						return previous;
					},
					{} as Record<string, number>,
				),
			),
		),
	);

	const session = authClient.useSession();

	let ownReaction = $derived.by(() => {
		const filtered = quote.reactions.filter(
			(r) => r.user?.id === $session.data?.user.id,
		);

		return filtered.length > 0 ? filtered[0].content : undefined;
	});
</script>

<Card.Root
	class="quote-card relative overflow-visible p-4 [--card-spacing:--spacing(1)]"
>
	<Card.Content class="pl-0">
		<p class="font-display text-[1.05rem] leading-snug text-balance">
			&ldquo;{quote.text}&rdquo;
		</p>

		<div class="absolute top-2 right-2">
			<div class="flex flex-col items-center gap-1">
				{#if quote.context}
					<GeneralTooltip>
						{#snippet trigger()}
							<SquareText class="size-4" />
						{/snippet}
						{#snippet content()}
							<p class="max-w-64 text-sm">
								{quote.context}
							</p>
						{/snippet}
					</GeneralTooltip>
				{/if}
			</div>
		</div>

		{#if bottomRight}
			<div class="absolute bottom-2 right-2">
				{@render bottomRight()}
			</div>
		{/if}
	</Card.Content>

	<Card.Footer class="pl-0">
		<p class="mt-3 text-sm text-muted-foreground">
			— <span class={cn(quote.person ? "" : "italic")}>
				{quote.person ?? m.group_anonymousPersonDisplay()}
			</span>

			<span class="text-muted-foreground/65">
				· {formatDate(quote.quotedAt)}
			</span>
		</p>
	</Card.Footer>

	<div class="absolute -bottom-4 left-2">
		<span
			class="inline-flex items-center gap-2 rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground"
		>
			{#each reactionCounts.entries() as [reaction, count] (reaction)}
				<span
					class={cn(
						ownReaction === reaction
							? "rounded-full bg-primary/15 px-1.5 py-0.5 text-primary"
							: "",
					)}
					title={`${reaction}: ${count}`}
				>
					<span>{reaction}</span>
					<span>{count}</span>
				</span>
			{/each}

			<span class="">
				<EmojiPickerPopoverForm action="?/reactToQuote">
					{#snippet hiddenFields()}
						<input type="hidden" name="quoteId" value={quote.id} />
					{/snippet}
				</EmojiPickerPopoverForm>
			</span>
		</span>
	</div>
</Card.Root>

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

		.normally-hidden {
			display: block;
		}
	}

	.normally-hidden {
		display: none;
	}
</style>
