<script lang="ts">
	import * as Card from "#lib/shadcn/components/ui/card/index.js";
	import LoginForm from "#lib/components/forms/LoginForm.svelte";
	import { m } from "#lib/paraglide/messages.js";
	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();
</script>

<div class="mb-8">
	<h1 class="mt-2 font-display text-3xl font-semibold tracking-tight">
		{m.account_title()}
	</h1>
	<p class="mt-2 max-w-xl text-muted-foreground">
		{m.account_intro()}
	</p>
</div>

<Card.Root class="mb-10 max-w-md">
	<LoginForm form={data.loginForm} />

	<a href="/signup">Don't have an account?</a>
</Card.Root>
