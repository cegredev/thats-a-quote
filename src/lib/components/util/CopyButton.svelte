<script lang="ts">
	import { m } from "#lib/paraglide/messages.js";
	import * as Button from "#lib/components_shadcn/ui/button/index.js";
	import type { Snippet } from "svelte";

	let {
		content,
		copyText,
		copySnippet,
	}: { content: string; copyText?: string; copySnippet?: Snippet } = $props();

	let copied = $state(false);

	async function copyToClipboard() {
		await navigator.clipboard.writeText(content);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}
</script>

<Button.Root variant="ghost" size="sm" onclick={copyToClipboard}>
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
