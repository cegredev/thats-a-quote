<script lang="ts">
	import { enhance } from "$app/forms";
	import { authClient } from "$lib/client/frontend-auth";
	import type { MaybePromise } from "$lib/types";

	let {
		action,
		onSuccess,
		text,
		classes,
		serverRequiresUser,
	}: {
		action: string;
		onSuccess: () => MaybePromise<void>;
		text: string;
		classes: string;
		serverRequiresUser?: boolean;
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
		<button type="submit" class={classes}>
			{text}
		</button>
	</form>
{:else}
	<button
		type="button"
		class={classes}
		onclick={async () => await onSuccess()}
	>
		{text}
	</button>
{/if}
