<script lang="ts">
	import type { ComponentProps } from "svelte";
	import * as Switch from "#lib/components_shadcn/ui/switch/index.js";

	let {
		checked = $bindable(false),
		labelText,
		...restProps
	}: ComponentProps<typeof Switch.Root> & {
		labelText: string;
	} = $props();
</script>

<div class="flex items-center gap-2">
	<Switch.Root bind:checked aria-label={labelText} {...restProps} />
	<span class="text-sm font-medium">{labelText}</span>
</div>
