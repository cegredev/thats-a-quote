<script lang="ts">
	import { m } from "#lib/paraglide/messages.js";
	import type { Group } from "#lib/types.js";
	import * as Card from "#lib/components_shadcn/ui/card/index.js";

	let { groups }: { groups: Group[] } = $props();
</script>

{#if groups.length === 0}
	<div class="rounded-lg border border-dashed px-5 py-8 text-center">
		<p class="text-muted-foreground">
			{m["home.empty"]()}
		</p>
	</div>
{:else}
	<ul class="flex flex-col gap-2">
		{#each groups as group (group.id)}
			<li>
				<Card.Root
					class="p-0 transition-colors hover:border-primary/50 hover:bg-muted"
				>
					<a
						href={`/group/${group.id}`}
						class="flex items-center justify-between rounded-lg px-4 py-3"
					>
						<span class="font-medium">{group.name}</span>
					</a>
				</Card.Root>
			</li>
		{/each}
	</ul>
{/if}
