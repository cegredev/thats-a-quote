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
	<Select.Trigger class="select w-min pr-8">
		<Select.Value {placeholder} />
	</Select.Trigger>

	<Select.Portal>
		<Select.Content
			class="bg-base-100 border outline-hidden z-50 h-fit max-h-[--bits-select-content-available-height] w-[--bits-select-anchor-width] min-w-[--bits-select-anchor-width] select-none rounded-xl px-1 py-3"
			{...contentProps}
		>
			<!-- <Select.ScrollUpButton>up</Select.ScrollUpButton> -->
			<Select.Viewport class="p-1">
				{#each items as { value, label, disabled } (value)}
					<Select.Item
						{value}
						{label}
						{disabled}
						class="btn btn-ghost border-0 flex h-10 w-full select-none items-center justify-center py-3 px-3 text-sm capitalize"
					>
						{#snippet children({ selected })}
							<!-- {selected ? "✅" : ""} -->
							{label}
						{/snippet}
					</Select.Item>
				{/each}
			</Select.Viewport>
			<!-- <Select.ScrollDownButton>down</Select.ScrollDownButton> -->
		</Select.Content>
	</Select.Portal>
</Select.Root>
