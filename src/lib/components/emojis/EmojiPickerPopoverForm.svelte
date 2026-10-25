<script lang="ts">
	import { settled, type Snippet } from "svelte";
	import EmojiPickerPopover from "./EmojiPickerPopover.svelte";
	import { enhance } from "$app/forms";

	let { action, hiddenFields }: { action: string; hiddenFields?: Snippet } =
		$props();

	let formElement: HTMLFormElement | undefined = $state();
	let emoji: string = $state("");
</script>

<EmojiPickerPopover
	onSelect={async (value) => {
		emoji = value;

		await settled();

		formElement?.requestSubmit();
	}}
/>

<form use:enhance {action} class="hidden" method="POST" bind:this={formElement}>
	<input type="hidden" name="content" value={emoji} />

	{#if hiddenFields}
		{@render hiddenFields()}
	{/if}
</form>
