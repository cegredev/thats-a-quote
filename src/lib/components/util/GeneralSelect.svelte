<script lang="ts">
	import * as Select from "#lib/components_shadcn/ui/select/index.js";

	type Props = {
		value: string;
		placeholder?: string;
		items: { value: string; label: string; disabled?: boolean }[];
	};

	let {
		value = $bindable(),
		items,
		placeholder,
	}: Props = $props();
</script>

<Select.Root type="single" bind:value>
	<Select.Trigger class="w-min">
		<Select.Value {placeholder} />
	</Select.Trigger>

	<Select.Content>
		{#each items as { value: itemValue, label, disabled } (itemValue)}
			<Select.Item value={itemValue} {label} {disabled} />
		{/each}
	</Select.Content>
</Select.Root>
