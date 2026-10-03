<script lang="ts">
	import { Select, type WithoutChildren } from "bits-ui";

	type Props = WithoutChildren<Select.RootProps> & {
		placeholder?: string;
		items: { value: string; label: string; disabled?: boolean }[];
		contentProps?: WithoutChildren<Select.ContentProps>;
		// any other specific component props if needed
	};

	let {
		value = $bindable(),
		items,
		contentProps,
		placeholder,
		...restProps
	}: Props = $props();
</script>

<!--
TypeScript Discriminated Unions + destructing (required for "bindable") do not
get along, so we shut typescript up by casting `value` to `never`, however,
from the perspective of the consumer of this component, it will be typed appropriately.
-->
<Select.Root {items} bind:value={value as never} {...restProps}>
	<Select.Trigger class="select">
		<Select.Value {placeholder} />
	</Select.Trigger>
	<Select.Portal>
		<Select.Content {...contentProps}>
			<!-- <Select.ScrollUpButton>up</Select.ScrollUpButton> -->
			<Select.Viewport>
				{#each items as { value, label, disabled } (value)}
					<Select.Item
						{value}
						{label}
						{disabled}
						class="btn data-highlighted:bg-muted outline-hidden data-disabled:opacity-50 flex h-10 w-full select-none items-center py-3 pl-5 pr-1.5 text-sm capitalize"
					>
						{#snippet children({ selected })}
							{selected ? "✅" : ""}
							{label}
						{/snippet}
					</Select.Item>
				{/each}
			</Select.Viewport>
			<!-- <Select.ScrollDownButton>down</Select.ScrollDownButton> -->
		</Select.Content>
	</Select.Portal>
</Select.Root>
