<script lang="ts">
	import { m } from "#lib/paraglide/messages.js";
	import * as Button from "#lib/components_shadcn/ui/button/index.js";

	let { content, copyText }: { content: string; copyText: string } = $props();

	let copied = $state(false);

	async function copyToClipboard() {
		await navigator.clipboard.writeText(content);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}
</script>

<Button.Root variant="ghost" size="sm" onclick={copyToClipboard}>
	{copied ? m.group_copied() : copyText}
</Button.Root>
