<script lang="ts">
	import { m } from "#lib/paraglide/messages.js";
	import * as Dialog from "#lib/shadcn/components/ui/dialog/index.js";
	import { buttonVariants } from "#lib/shadcn/components/ui/button/index.js";
	import type { Snippet } from "svelte";

	type Props = {
		text: {
			trigger: string;
			title: string;
			description: string;
			close?: string;
		};
		buttons: Snippet;
		open?: boolean;
	};

	let { text, buttons, open = $bindable(false) }: Props = $props();
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger
		class={`${buttonVariants({ variant: "ghost", size: "sm" })} text-destructive`}
	>
		{text.trigger}
	</Dialog.Trigger>

	<Dialog.Portal>
		<Dialog.Overlay />

		<Dialog.Content class="max-w-lg">
			<Dialog.Header>
				<Dialog.Title>{text.title}</Dialog.Title>
				<Dialog.Description>{text.description}</Dialog.Description>
			</Dialog.Header>

			<Dialog.Footer class="justify-end">
				<Dialog.Close class={buttonVariants({ variant: "ghost" })}>
					{text.close ?? m.common_cancel()}
				</Dialog.Close>

				{@render buttons()}
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
