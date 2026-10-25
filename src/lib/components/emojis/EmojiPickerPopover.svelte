<script lang="ts">
	import { buttonVariants } from "#lib/shadcn/components/ui/button/index.ts";
	import * as EmojiPicker from "#lib/shadcn/components/ui/emoji-picker/index.ts";
	import * as Popover from "#lib/shadcn/components/ui/popover/index.ts";
	import type { MaybePromise } from "#lib/types.ts";
	import { cn } from "#lib/utils.js";
	import SmilePlusIcon from "@lucide/svelte/icons/smile-plus";

	let emoji = $state<string>("");
	let open = $state(false);

	let { onSelect }: { onSelect: (emoji: string) => MaybePromise<void> } =
		$props();
</script>

<EmojiPicker.Root
	disableInitialScroll
	bind:value={emoji}
	onSelect={(selected) => {
		open = false;
		onSelect(selected.emoji);
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
			<SmilePlusIcon />
		</Popover.Trigger>
		<Popover.Content class="w-auto p-0">
			<EmojiPicker.Search />
			<EmojiPicker.List />
		</Popover.Content>
	</Popover.Root>
</EmojiPicker.Root>
