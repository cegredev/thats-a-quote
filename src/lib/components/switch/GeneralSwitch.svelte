<script lang="ts">
	import { Switch, Label, useId, type WithoutChildrenOrChild } from "bits-ui";

	let {
		id = useId(),
		checked = $bindable(false),
		ref = $bindable(null),
		labelText,
		...restProps
	}: WithoutChildrenOrChild<Switch.RootProps> & {
		labelText: string;
	} = $props();
</script>

<div class="flex gap-2">
	<Label.Root for={id} class="text-sm font-medium">{labelText}</Label.Root>
	<input type="checkbox" bind:checked class="toggle" {...restProps} />
</div>
