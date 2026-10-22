<script lang="ts">
	import type { PageProps } from "./$types";
	import { m } from "#lib/paraglide/messages.js";
	import Quote from "#lib/components/quotes/Quote.svelte";
	import { Pencil } from "@lucide/svelte";
	import { page } from "$app/state";
	import Button from "#lib/components_shadcn/ui/button/button.svelte";
	import * as Card from "#lib/components_shadcn/ui/card/index.js";

	let { data }: PageProps = $props();

	const reactions = ["❤️", "😂", "😱", "❌", "💀"];
</script>

<div class="flex flex-col items-center justify-center h-full">
	<div class="flex flex-col items-center gap-4">
		<Quote quote={data.quote}>
			{#snippet bottomRight()}
				<a href={`${page.url.pathname}/edit`}>
					<Pencil class="size-4" />
				</a>
			{/snippet}
		</Quote>

		<Card.Root size="sm" class="p-1">
			<Card.Content>
				{#each reactions as reaction}
					<Button variant="ghost" size="default" class="rounded-full">
						<span class="text-xl">{reaction}</span>
					</Button>
				{/each}
			</Card.Content>
		</Card.Root>
	</div>
</div>
