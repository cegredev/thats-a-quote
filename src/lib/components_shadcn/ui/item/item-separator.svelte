<script lang="ts">
	import { Separator } from "#lib/components_shadcn/ui/separator/index.js";
	import { cn } from "#lib/utils_shadcn.js";
	import type { ComponentProps } from "svelte";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: ComponentProps<typeof Separator> = $props();
</script>

<Separator
	bind:ref
	data-slot="item-separator"
	orientation="horizontal"
	class={cn("my-2", className)}
	{...restProps}
/>
