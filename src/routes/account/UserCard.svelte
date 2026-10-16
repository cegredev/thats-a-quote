<script lang="ts">
	import { authClient } from "#lib/client/frontend-auth.js";
	import { m } from "#lib/paraglide/messages.js";
	import type { User } from "better-auth";
	import * as Button from "#lib/components_shadcn/ui/button/index.js";
	import * as Card from "#lib/components_shadcn/ui/card/index.js";

	let { user }: { user: User } = $props();

	async function signOut() {
		await authClient.signOut();
	}
</script>

<Card.Root class="mt-8 max-w-sm p-6">
	<p class="text-sm text-muted-foreground">{m["account.signedInAs"]()}</p>

	<p class="font-display text-lg font-semibold">
		{user.name}
	</p>

	<div class="mt-5 flex gap-2">
		<Button.Root variant="ghost" size="sm" onclick={signOut}>
			{m["account.forget"]()}
		</Button.Root>
	</div>
</Card.Root>
