<script lang="ts" generics="T extends string">
	import { Tabs } from "bits-ui";
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

	let { values, configs, ...content }: Props = $props();

	let contentTabs = $derived(content as unknown as ContentTabs);
</script>

<Tabs.Root value="login">
	<Tabs.List class="tabs tabs-box w-fit">
		{#each values as value}
			<Tabs.Trigger {value} class="tab data-[state=active]:tab-active">
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
