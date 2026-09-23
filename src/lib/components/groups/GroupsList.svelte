<script lang="ts">
	import { m } from "$lib/paraglide/messages";
	import type { Group } from "$lib/types";

	let { groups }: { groups: Group[] } = $props();
</script>

{#if groups.length === 0}
	<div
		class="rounded-box border border-dashed border-base-300 px-5 py-8 text-center"
	>
		<p class="text-base-content/70">
			{m["home.empty"]()}
		</p>
	</div>
{:else}
	<ul class="flex flex-col gap-2">
		{#each groups as group (group.id)}
			<li>
				<a
					href={`/group/${group.id}`}
					class="flex items-center justify-between rounded-box border border-base-300 bg-base-100 px-4 py-3 transition hover:border-primary/50 hover:bg-base-200"
				>
					<span class="font-medium">{group.name}</span>
				</a>
			</li>
		{/each}
	</ul>
{/if}
