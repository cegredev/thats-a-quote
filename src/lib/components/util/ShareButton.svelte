<script module lang="ts">
	let shareDisabled = $state(false);
</script>

<script lang="ts">
	import { Link, Share } from "@lucide/svelte";
	import * as Button from "#lib/shadcn/components/ui/button/index.js";
	import CopyButton from "./CopyButton.svelte";

	let { content }: { content: ShareData } = $props();

	async function doShare() {
		if (!navigator.share) return;

		shareDisabled = false;
		const fallbackTimer = /Firefox/i.test(navigator.userAgent)
			? setTimeout(() => {
					shareDisabled = true;
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
			shareDisabled = false;
		}
	}
</script>

<!-- navigator.share can be undefined, but the types don't reflect that -->
{#if (navigator.share as any) && !shareDisabled}
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
