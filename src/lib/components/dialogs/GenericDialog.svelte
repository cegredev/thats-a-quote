<script lang="ts">
	import { Dialog } from "bits-ui";
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
	<Dialog.Trigger class="btn btn-ghost btn-sm text-error">
		{text.trigger}
	</Dialog.Trigger>

	<Dialog.Portal>
		<Dialog.Overlay
			class="fixed inset-0 z-50 bg-black/50
  				   transition-opacity duration-200 ease-out
				   data-[state=open]:opacity-100 data-[state=closed]:opacity-0"
		/>

		<Dialog.Content
			class="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2
				   sm:max-w-122.5 md:w-full max-w-lg
			       rounded-box bg-base-100 p-6 shadow-2xl
  				   transition-opacity duration-200 ease-out
				   data-[state=open]:opacity-100 data-[state=closed]:opacity-0
				   outline-hidden"
		>
			<Dialog.Title class="text-xl font-bold">{text.title}</Dialog.Title>

			<Dialog.Description class="mt-2 text-base-content/70">
				{text.description}
			</Dialog.Description>

			<div class="mt-6 flex justify-end gap-2">
				<Dialog.Close class="btn btn-ghost">
					{text.close ?? "Cancel"}
				</Dialog.Close>

				{@render buttons()}
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
