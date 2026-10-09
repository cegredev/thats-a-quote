<script lang="ts" generics="T extends string">
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import type { LucideIcon } from "@lucide/svelte";
	import { Tabs } from "bits-ui";

	type Config = {
		label: string;
		icon: LucideIcon;
		navigate: string;
	};

	type Props = {
		values: T[];
		configs: Record<T, Config>;
	};

	let { values, configs }: Props = $props();

	let startingValue = $derived.by(() => {
		const possible = Object.entries(configs) as [T, Config][];

		const matching = possible.filter(([values, config]) =>
			page.url.pathname.startsWith(config.navigate),
		);

		matching.sort(
			([_a, a], [_b, b]) => b.navigate.length - a.navigate.length,
		);

		return matching[0][0];
	});

	// let startingValue = $derived(
	// 	([...Object.values(configs)]
	// 		.filter((c: any) => page.url.pathname.startsWith(c.navigation))
	// 		.toSorted(
	// 			(a: any, b: any) => a.navigation.length - b.navigation.length,
	// 		)[0]) as string,
	// );
</script>

<Tabs.Root value={startingValue} class="w-full">
	<Tabs.List class="tabs tabs-box w-full grid auto-cols-[1fr] grid-flow-col">
		{#each values as value}
			{@const config = configs[value]}

			<Tabs.Trigger
				{value}
				class="tab data-[state=active]:tab-active"
				onclick={async () => await goto(config.navigate)}
			>
				<div class="flex flex-col items-center justify-center">
					<span><config.icon /> </span>
					<span>{configs[value as T].label}</span>
				</div>
			</Tabs.Trigger>
		{/each}
	</Tabs.List>
</Tabs.Root>
