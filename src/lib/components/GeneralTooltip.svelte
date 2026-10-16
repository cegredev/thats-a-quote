<script lang="ts">
	import * as Tooltip from "#lib/components_shadcn/ui/tooltip/index.js";
	import type { Snippet } from "svelte";

	let { trigger, content }: { trigger: Snippet; content: Snippet } = $props();
</script>

<Tooltip.Provider>
	<Tooltip.Root delayDuration={200}>
		<Tooltip.Trigger aria-label="More information">
			{@render trigger()}
		</Tooltip.Trigger>

		<Tooltip.Content
			sideOffset={8}
			class="flex items-center justify-center border p-3"
		>
			{@render content()}
		</Tooltip.Content>
	</Tooltip.Root>
</Tooltip.Provider>
