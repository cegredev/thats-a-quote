<script lang="ts">
	import type { PageProps } from "./$types";
	import { m } from "#lib/paraglide/messages.js";
	import Quote from "#lib/components/quotes/Quote.svelte";
	import { Pencil } from "@lucide/svelte";
	import { page } from "$app/state";
	import * as Card from "#lib/components_shadcn/ui/card/index.js";
	import FormButton from "#lib/components/forms/FormButton.svelte";
	import { authClient } from "#lib/client/frontend-auth.ts";

	let { data }: PageProps = $props();

	const reactions = ["❤️", "😂", "😱", "❌", "💀"];

	const session = authClient.useSession();

	let ownReactions: string[] = $derived(
		data.quote.reactions
			.filter((r) => r.userId === $session.data?.user.id)
			.map((r) => r.content),
	);

	let quoteReactions = $derived.by(() => {
		const counts = new Map<string, number>();
		for (const reaction of data.quote.reactions) {
			counts.set(reaction.content, (counts.get(reaction.content) ?? 0) + 1);
		}
		return Array.from(counts, ([content, count]) => ({ content, count }));
	});
</script>

<div class="flex flex-col items-center justify-center h-full">
	<div class="flex flex-col items-center gap-4">
		<Quote quote={data.quote} reactions={quoteReactions}>
			{#snippet bottomRight()}
				<a href={`${page.url.pathname}/edit`}>
					<Pencil class="size-4" />
				</a>
			{/snippet}
		</Quote>

		<Card.Root size="sm" class="p-1">
			<Card.Content class="flex">
				{#each reactions as reaction}
					<div class="relative">
						<FormButton
							variant={ownReactions.includes(reaction)
								? "outline"
								: "ghost"}
							size="default"
							classes="rounded-full"
							action="?/reactToQuote"
						>
							{#snippet text()}
								<span class="text-xl">
									{reaction}
								</span>
							{/snippet}
							{#snippet hiddenInputs()}
								<input
									name="content"
									type="hidden"
									value={reaction}
								/>
							{/snippet}
						</FormButton>

						<span class="absolute right-0 bottom-0">
							{data.quote.reactions.filter(
								(r) => r.content === reaction,
							).length}
						</span>
					</div>
				{/each}
			</Card.Content>
		</Card.Root>
	</div>
</div>
