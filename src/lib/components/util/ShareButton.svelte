<script lang="ts">
	import { Link, Share } from "@lucide/svelte";
	import * as Button from "#lib/shadcn/components/ui/button/index.js";
	import CopyButton from "./CopyButton.svelte";

	let { content }: { content: ShareData } = $props();
	let showCopyFallback = $state(false);

	async function doShare() {
		if (!navigator.share) return;

		showCopyFallback = false;
		const fallbackTimer = /Firefox/i.test(navigator.userAgent)
			? setTimeout(() => {
					showCopyFallback = true;
				}, 5_000)
			: undefined;

		try {
			await navigator.share({ ...content });
		} catch (error) {
			if (
				!(error instanceof DOMException && error.name === "AbortError")
			) {
				console.error("Error sharing:", error);
			}
		} finally {
			clearTimeout(fallbackTimer);
			showCopyFallback = false;
		}
	}
</script>

<!-- navigator.share can be undefined, but the types don't reflect that -->
{#if (navigator.share as any) && !showCopyFallback}
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
