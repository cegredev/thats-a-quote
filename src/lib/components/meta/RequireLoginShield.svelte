<script lang="ts">
	import { authClient } from "#lib/client/frontend-auth.js";
	import type { Snippet } from "svelte";
	import { gotoDrawer } from "#lib/client/drawers.svelte.ts";

	let { children }: { children: Snippet } = $props();

	const session = authClient.useSession();
	// let drawerOpen = $state(false);

	async function handleClickCapture(event: MouseEvent) {
		if ($session.data?.user) return;

		event.preventDefault();
		event.stopPropagation();

		await gotoDrawer("require-login");
	}
</script>

<span class="contents" onclickcapture={handleClickCapture}>
	{@render children()}
</span>
