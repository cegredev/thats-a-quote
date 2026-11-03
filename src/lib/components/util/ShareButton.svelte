<script module lang="ts">
	let shareDisabled = $state(false);
</script>

<script lang="ts">
	import { Link, Share } from "@lucide/svelte";
	import * as Button from "#lib/shadcn/components/ui/button/index.js";
	import CopyButton from "./CopyButton.svelte";
	import { cn } from "cn";

	let {
		content,
		text,
		classes,
		variants,
		onComplete,
		disableCopyButtonTimeout,
	}: {
		content: ShareData;
		text?: { share?: string; copy?: string };
		classes?: { share: string };
		variants?: { action: Button.ButtonVariant };
		onComplete?: (success: boolean) => void;
		disableCopyButtonTimeout?: boolean;
	} = $props();

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
			onComplete?.(true);
		} catch (error) {
			if (
				!(error instanceof DOMException && error.name === "AbortError")
			) {
				console.error("Error sharing:", error);
			}
			onComplete?.(false);
		} finally {
			clearTimeout(fallbackTimer);
			shareDisabled = false;
		}
	}
</script>

<!-- navigator.share can be undefined, but the types don't reflect that -->
{#if (navigator.share as any) && !shareDisabled}
	<Button.Root
		size="sm"
		onclick={doShare}
		variant={variants?.action ?? "ghost"}
		class={cn(classes?.share ?? "")}
	>
		{#if text?.share}
			<span>{text.share}</span>
		{:else}
			<Share />
		{/if}
	</Button.Root>
{:else}
	<CopyButton
		content={content.url ?? content.text ?? ""}
		variant={variants?.action}
		{onComplete}
		timeout={disableCopyButtonTimeout ? 0 : undefined}
	>
		{#snippet copySnippet()}
			{#if text?.copy}
				<span>{text.copy}</span>
			{:else}
				<Link />
			{/if}
		{/snippet}
	</CopyButton>
{/if}
