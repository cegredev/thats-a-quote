<script lang="ts">
	import type { Action } from "svelte/action";
	import * as Command from "../command";
	import { Command as CommandPrimitive } from "bits-ui";
	import { Spinner } from "../spinner";
	import data, { type EmojiMartData } from "@emoji-mart/data";
	import * as casing from "../../../../shadcn/utils/casing";
	import type { EmojiPickerListProps } from "./types";
	import {
		makeValue,
		parseValue,
		useEmojiPickerList,
	} from "./emoji-picker.svelte.js";
	import { cn } from "../../../utils.js";

	let {
		ref = $bindable(null),
		emptyMessage = "No results.",
		class: className,
		...rest
	}: EmojiPickerListProps = $props();

	const emojiData = data as EmojiMartData;

	const filter = (value: string, keywords: string[]) => {
		if (!Array.isArray(keywords)) {
			return false;
		}

		for (const keyword of keywords) {
			if (keyword.toLowerCase().startsWith(value.toLowerCase()))
				return true;
		}

		return false;
	};

	const pickerState = useEmojiPickerList();
	let loadedCategories = $state<Record<string, boolean>>({});

	const loadWhenVisible: Action<HTMLDivElement, () => void> = (
		node,
		onVisible,
	) => {
		if (typeof IntersectionObserver === "undefined") {
			onVisible();
			return;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					onVisible();
					observer.disconnect();
				}
			},
			{ rootMargin: "200px" },
		);

		observer.observe(node);

		return {
			destroy() {
				observer.disconnect();
			},
		};
	};
</script>

<Command.List bind:ref class={cn("relative h-[200px]", className)} {...rest}>
	<Command.Empty
		class="absolute inset-0 flex place-items-center justify-center py-0"
	>
		{#if loadedCategories[emojiData.categories[0].id] || pickerState.root.emojiPickerState.search}
			{emptyMessage}
		{/if}
	</Command.Empty>
	{#if !loadedCategories[emojiData.categories[0].id] && !pickerState.root.emojiPickerState.search}
		<div
			class="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
		>
			<Spinner class="size-8 text-foreground" />
		</div>
	{/if}
	{#if pickerState.showRecents}
		{@const recents = pickerState.root.frecency?.items
			.filter((item) => {
				const { name } = parseValue(item);
				return filter(
					pickerState.root.emojiPickerState.search,
					emojiData.emojis[name].keywords,
				);
			})
			.slice(0, pickerState.maxRecents)}
		{#if recents && recents.length > 0}
			<CommandPrimitive.Group>
				<CommandPrimitive.GroupHeading
					class="text-muted-foreground px-2 py-1 text-xs"
				>
					Recents
				</CommandPrimitive.GroupHeading>
				<CommandPrimitive.GroupItems class="grid grid-cols-6 px-2">
					{#each recents as item (item)}
						{@const { name, skin } = parseValue(item)}
						{@const emoji =
							emojiData.emojis[name].skins[skin].native}
						<Command.Item
							class="flex aspect-square size-9 place-items-center justify-center text-lg [&_svg]:hidden!"
							value="{item}:recent"
							onSelect={() => {
								pickerState.select(item);
								pickerState.root.frecency?.use(item);
							}}
						>
							{emoji}
						</Command.Item>
					{/each}
				</CommandPrimitive.GroupItems>
			</CommandPrimitive.Group>
		{/if}
	{/if}
	{#each emojiData.categories as category (category.id)}
		{@const emojis = category.emojis.filter((item) =>
			filter(
				pickerState.root.emojiPickerState.search,
				emojiData.emojis[item].keywords,
			),
		)}
		{#if emojis.length > 0}
			<div
				use:loadWhenVisible={() =>
					(loadedCategories[category.id] = true)}
			>
				{#if loadedCategories[category.id] || pickerState.root.emojiPickerState.search}
					<CommandPrimitive.Group>
						<CommandPrimitive.GroupHeading
							class="text-muted-foreground px-2 py-1 text-xs"
						>
							{casing.camelToPascal(category.id)}
						</CommandPrimitive.GroupHeading>
						<CommandPrimitive.GroupItems
							class="grid grid-cols-6 px-2"
						>
							{#each emojis as item (item)}
								{@const emoji = emojiData.emojis[item]}
								{@const emojiSkin =
									emoji.skins.length > 1
										? pickerState.skinIndex
										: 0}
								{@const key = makeValue(item, emojiSkin)}
								<Command.Item
									class="flex aspect-square size-9 place-items-center justify-center text-lg [&_svg]:hidden!"
									value={item}
									onSelect={() => {
										pickerState.select(key);
										pickerState.root.frecency?.use(key);
									}}
								>
									{emoji.skins[emojiSkin].native}
								</Command.Item>
							{/each}
						</CommandPrimitive.GroupItems>
					</CommandPrimitive.Group>
				{:else}
					<div aria-hidden="true">
						<div class="text-muted-foreground px-2 py-1 text-xs">
							{casing.camelToPascal(category.id)}
						</div>
						<div
							style:height="{Math.ceil(emojis.length / 6) * 36}px"
						></div>
					</div>
				{/if}
			</div>
		{/if}
	{/each}
</Command.List>
