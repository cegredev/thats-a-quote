<script lang="ts">
	import * as Popover from "#lib/components_shadcn/ui/popover/index.js";
	import type { Snippet } from "svelte";

	let {
		trigger,
		content,
	}: {
		trigger: Snippet;
		content: Snippet;
	} = $props();
</script>

<Popover.Root>
	<Popover.Trigger
		class="inline-flex size-6 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
		aria-label="More information"
	>
		{@render trigger()}
	</Popover.Trigger>

	<Popover.Content
		class="w-64"
		side="top"
		align="end"
		sideOffset={6}
	>
		{@render content()}
	</Popover.Content>
</Popover.Root>
