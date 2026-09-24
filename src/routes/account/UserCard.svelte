<script lang="ts">
	import { authClient } from "$lib/client/frontend-auth";
	import { m } from "$lib/paraglide/messages";
	import type { User } from "better-auth";

	let { user }: { user: User } = $props();

	async function signOut() {
		await authClient.signOut();
	}
</script>

<div class="mt-8 max-w-sm rounded-box border border-base-300 bg-base-100 p-6">
	<p class="text-sm text-base-content/60">{m["account.signedInAs"]()}</p>

	<p class="font-display text-lg font-semibold">
		{user.name}
	</p>

	<div class="mt-5 flex gap-2">
		<button class="btn btn-ghost btn-sm" onclick={signOut}>
			{m["account.forget"]()}
		</button>
	</div>
</div>
