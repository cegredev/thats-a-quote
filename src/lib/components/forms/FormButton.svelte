<script lang="ts">
	import { enhance } from "$app/forms";
	import { authClient } from "#lib/client/frontend-auth.js";
	import type { MaybePromise } from "#lib/types.js";
	import * as Button from "#lib/components_shadcn/ui/button/index.js";
	import type {
		ButtonSize,
		ButtonVariant,
	} from "#lib/components_shadcn/ui/button/index.js";

	let {
		action,
		onSuccess,
		text,
		classes = "",
		serverRequiresUser,
		variant = "default",
		size = "default",
	}: {
		action: string;
		onSuccess: () => MaybePromise<void>;
		text: string;
		classes?: string;
		serverRequiresUser?: boolean;
		variant?: ButtonVariant;
		size?: ButtonSize;
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

				if (result.type === "success" || result.type === "redirect") {
					await onSuccess();
				}
			}}
	>
		<Button.Root type="submit" {variant} {size} class={classes}>
			{text}
		</Button.Root>
	</form>
{:else}
	<Button.Root
		type="button"
		{variant}
		{size}
		class={classes}
		onclick={async () => await onSuccess()}
	>
		{text}
	</Button.Root>
{/if}
