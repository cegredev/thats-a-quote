<script lang="ts">
	import * as Card from "#lib/components_shadcn/ui/card/index.js";
	import { m } from "#lib/paraglide/messages.js";
	import type { Quote } from "#lib/zod-schemas.ts";
	import { CircleQuestionMark, Pencil } from "@lucide/svelte";
	import GeneralTooltip from "../GeneralTooltip.svelte";
	import { getLocale } from "#lib/paraglide/runtime.js";
	import { cn } from "cn";

	let { quote }: { quote: Quote } = $props();

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
</script>

<Card.Root class="quote-card relative p-4 [--card-spacing:--spacing(1)]">
	<Card.Content class="pl-0">
		<p class="font-display text-[1.05rem] leading-snug text-balance">
			&ldquo;{quote.text}&rdquo;
		</p>

		<div class="absolute top-2 right-2">
			<div class="flex flex-col items-center gap-1">
				{#if quote.context}
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
				{/if}
			</div>
		</div>

		<div class="absolute bottom-2 right-2">
			<a href={`/quotes/${quote.id}/edit`} class="normally-hidden">
				<Pencil class="size-4" />
			</a>
		</div>
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
