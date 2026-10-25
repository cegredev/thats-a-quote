<script lang="ts" generics="T extends string">
	import * as Tabs from "#lib/shadcn/components/ui/tabs/index.js";
	import type { Snippet } from "svelte";

	type ContentTabs = Record<`content_${T}`, Snippet>;

	type Props = {
		values: T[];
		default: T;
		configs: Record<
			T,
			{
				label: string;
			}
		>;
	} & ContentTabs;

	let {
		values,
		configs,
		default: defaultValue,
		...content
	}: Props = $props();

	let contentTabs = $derived(content as unknown as ContentTabs);
</script>

<Tabs.Root value={defaultValue}>
	<Tabs.List class="w-fit">
		{#each values as value}
			<Tabs.Trigger {value}>
				{configs[value as T].label}
			</Tabs.Trigger>
		{/each}
	</Tabs.List>

	{#each values as value}
		{@const tab = contentTabs[`content_${value}`]}

		<Tabs.Content {value} class="select-none pt-3">
			{@render tab()}
		</Tabs.Content>
	{/each}
</Tabs.Root>
