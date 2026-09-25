<script lang="ts">
	import { Tooltip } from "bits-ui";
	import type { Snippet } from "svelte";

	let { trigger, content }: { trigger: Snippet; content: Snippet } = $props();
</script>

<Tooltip.Provider>
	<Tooltip.Root delayDuration={200}>
		<Tooltip.Trigger>
			{@render trigger()}
		</Tooltip.Trigger>

		<Tooltip.Content
			sideOffset={8}
			class="bg-base-100 rounded-lg border-dark-10 z-0 flex items-center justify-center border p-3"
		>
			{@render content()}
		</Tooltip.Content>
	</Tooltip.Root>
</Tooltip.Provider>
