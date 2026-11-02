<script lang="ts">
	import { Link, Share } from "@lucide/svelte";
	import * as Button from "#lib/shadcn/components/ui/button/index.js";
	import CopyButton from "./CopyButton.svelte";

	let { content }: { content: ShareData } = $props();

	// share is not always defined, but the default types don't reflect that
	const share = navigator.share as undefined | typeof navigator.share;

	const doShare = async () => {
		if (share) {
			await share(content);
		} else {
			console.warn("Web Share API is not supported in this browser.");
		}
	};
</script>

{#if share}
	<Button.Root variant="ghost" size="sm" onclick={doShare}>
		<Share />
	</Button.Root>
{:else}
	<CopyButton content={content.url ?? content.text ?? ""}>
		{#snippet copySnippet()}
			<Link />
		{/snippet}
	</CopyButton>
{/if}
