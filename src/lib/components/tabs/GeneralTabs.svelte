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

<Tabs.Root
	value="login"
	class="mt-8 max-w-sm rounded-box border border-base-300 bg-base-100 p-6"
>
	<Tabs.List
		class="rounded-9px bg-dark-10 shadow-mini-inset dark:bg-background grid w-full grid-cols-2 gap-1 p-1 text-sm font-semibold leading-[0.01em] dark:border dark:border-neutral-600/30"
	>
		{#each values as value}
			<Tabs.Trigger
				{value}
				class="data-[state=active]:shadow-mini dark:data-[state=active]:bg-muted h-8 rounded-[7px] bg-transparent py-2 data-[state=active]:bg-white"
			>
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
