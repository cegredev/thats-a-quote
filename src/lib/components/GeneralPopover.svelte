<script lang="ts">
	import { Popover } from "bits-ui";
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
		class="inline-flex size-6 items-center justify-center rounded-full text-muted-foreground hover:bg-base-200 hover:text-base-content"
		aria-label="More information"
	>
		{@render trigger()}
	</Popover.Trigger>

	<Popover.Content
		class="z-50 w-64 rounded-lg border bg-base-100 p-4 shadow-lg"
		side="bottom"
		align="end"
		sideOffset={6}
	>
		{@render content()}

		<Popover.Arrow class="fill-base-100" />
	</Popover.Content>
</Popover.Root>
