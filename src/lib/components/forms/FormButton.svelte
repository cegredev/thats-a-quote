<script lang="ts">
	import { enhance } from "$app/forms";
	import { authClient } from "#lib/client/frontend-auth.js";
	import type { MaybePromise } from "#lib/types.js";
	import * as Button from "#lib/shadcn/components/ui/button/index.js";
	import type {
		ButtonSize,
		ButtonVariant,
	} from "#lib/shadcn/components/ui/button/index.js";
	import type { Snippet } from "svelte";

	let {
		action,
		onSuccess,
		text,
		classes = "",
		serverRequiresUser,
		variant = "default",
		size = "default",
		hiddenInputs,
	}: {
		action: string;
		onSuccess?: () => MaybePromise<void>;
		classes?: string;
		serverRequiresUser?: boolean;
		variant?: ButtonVariant;
		size?: ButtonSize;
		hiddenInputs?: Snippet;
		text: string | Snippet;
	} = $props();

	const session = authClient.useSession();
</script>

{#if !serverRequiresUser || $session.data?.user}
	<form
		method="POST"
		{action}
		use:enhance={() =>
			async ({ result, update }) => {
				await update();

				if (
					onSuccess &&
					(result.type === "success" || result.type === "redirect")
				) {
					await onSuccess();
				}
			}}
	>
		{#if hiddenInputs}
			{@render hiddenInputs()}
		{/if}

		<Button.Root type="submit" {variant} {size} class={classes}>
			{#if typeof text === "string"}
				{text}
			{:else}
				{@render text()}
			{/if}
		</Button.Root>
	</form>
{:else}
	<Button.Root
		type="button"
		{variant}
		{size}
		class={classes}
		onclick={async () => onSuccess && (await onSuccess())}
	>
		{#if typeof text === "string"}
			{text}
		{:else}
			{@render text()}
		{/if}
	</Button.Root>
{/if}
