<script lang="ts">
	import { m } from "$lib/paraglide/messages";

	let { content, copyText }: { content: string; copyText: string } = $props();

	let copied = $state(false);

	async function copyToClipboard() {
		await navigator.clipboard.writeText(content);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}
</script>

<button class="btn btn-ghost btn-sm" onclick={copyToClipboard}>
	{copied ? m["group.copied"]() : copyText}
</button>
