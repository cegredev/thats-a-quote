<script lang="ts">
	import { Popover } from "bits-ui";
	import type { Snippet } from "svelte";

	let {
		trigger,
		content,
		contentProps,
	}: {
		trigger: Snippet;
		content: Snippet;
		contentProps?: Popover.ContentProps;
	} = $props();
</script>

<Popover.Root>
	<Popover.Trigger
		openOnHover
		openDelay={0}
		closeDelay={0}
		class="inline-flex size-6 items-center justify-center rounded-full text-muted-foreground hover:bg-base-200 hover:text-base-content"
		aria-label="More information"
	>
		{@render trigger()}
	</Popover.Trigger>

	<Popover.Content
		class="z-50 w-64 rounded-lg border bg-base-100 p-4 shadow-lg"
		side="top"
		align="end"
		sideOffset={6}
		{...contentProps}
	>
		{@render content()}

		<Popover.Arrow class="fill-base-100" />
	</Popover.Content>
</Popover.Root>
