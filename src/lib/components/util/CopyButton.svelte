<script lang="ts">
	import { m } from "#lib/paraglide/messages.js";
	import * as Button from "#lib/shadcn/components/ui/button/index.js";
	import type { Snippet } from "svelte";

	let {
		content,
		copyText,
		copySnippet,
		variant,
		onComplete,
		timeout,
		size,
	}: {
		content: string;
		copyText?: string;
		copySnippet?: Snippet;
		variant?: Button.ButtonVariant;
		onComplete?: (success: boolean) => void;
		timeout?: number;
		size?: Button.ButtonSize;
	} = $props();

	let copied = $state(false);

	async function copyToClipboard() {
		await navigator.clipboard.writeText(content);
		copied = true;
		setTimeout(() => {
			copied = false;
			onComplete?.(true);
		}, timeout ?? 1500);
	}
</script>

<Button.Root
	variant={variant ?? "ghost"}
	size={size ?? "sm"}
	onclick={copyToClipboard}
>
	{#if copied}
		{m.group_copied()}
	{:else if copyText}
		{copyText}
	{:else if copySnippet}
		{@render copySnippet()}
	{:else}
		COPY TEXT MISSING
	{/if}
</Button.Root>
