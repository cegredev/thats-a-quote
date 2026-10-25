<script lang="ts">
	import { m } from "#lib/paraglide/messages.js";
	import * as Tooltip from "#lib/shadcn/components/ui/tooltip/index.js";
	import type { Snippet } from "svelte";

	let { trigger, content }: { trigger: Snippet; content: Snippet } = $props();
</script>

<Tooltip.Provider>
	<Tooltip.Root delayDuration={200}>
		<Tooltip.Trigger aria-label={m.common_moreInformation()}>
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
