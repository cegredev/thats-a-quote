<script lang="ts">
	import { buttonVariants } from "#lib/components_shadcn/ui/button/index.ts";
	import * as EmojiPicker from "#lib/components_shadcn/ui/emoji-picker/index.ts";
	import * as Popover from "#lib/components_shadcn/ui/popover/index.ts";
	import { cn } from "#lib/utils.js";
	import SmilePlusIcon from "@lucide/svelte/icons/smile-plus";

	let emoji = $state<string>("");

	let open = $state(false);
</script>

<EmojiPicker.Root
	disableInitialScroll
	bind:value={emoji}
	onSelect={(selected) => {
		open = false;
		console.log(selected);
	}}
>
	<Popover.Root bind:open>
		<Popover.Trigger
			class={cn(
				buttonVariants({
					variant: "ghost",
					size: "sm",
					class: "rounded-full  h-min p-0",
				}),
			)}
		>
			{#if emoji === ""}
				<SmilePlusIcon />
			{:else}
				{emoji}
			{/if}
		</Popover.Trigger>
		<Popover.Content class="w-auto p-0">
			<EmojiPicker.Search />
			<EmojiPicker.List />
		</Popover.Content>
	</Popover.Root>
</EmojiPicker.Root>
