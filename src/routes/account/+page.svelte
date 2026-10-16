<script lang="ts">
	import { authClient } from "#lib/client/frontend-auth.js";
	import { m } from "#lib/paraglide/messages.js";
	import type { PageProps } from "./$types";
	import LoginForm from "#lib/components/forms/LoginForm.svelte";
	import RegisterForm from "#lib/components/forms/RegisterForm.svelte";
	import UserCard from "./UserCard.svelte";
	import Title from "#lib/components/util/Title.svelte";
	import GeneralTabs from "#lib/components/tabs/GeneralTabs.svelte";
	import * as Card from "#lib/components_shadcn/ui/card/index.js";

	let { data }: PageProps = $props();

	const session = authClient.useSession();
</script>

<Title text={`${m["syncDevices"]()} · ${m["brand"]()}`} />

<h1 class="font-display text-2xl font-semibold">
	{m["account.title"]()}
</h1>

<p class="mt-2 max-w-lg text-muted-foreground">
	{m["account.intro"]()}
</p>

{#if $session.data}
	<UserCard user={$session.data.user} />
{:else}
	<Card.Root class="mt-8 max-w-sm p-6">
		<GeneralTabs
			values={["login", "register"]}
			configs={{
				login: {
					label: "Log in",
				},
				register: {
					label: "Sign up",
				},
			}}
			default="login"
		>
			{#snippet content_login()}
				<LoginForm form={data.loginForm} />
			{/snippet}
			{#snippet content_register()}
				<RegisterForm form={data.registerForm} />
			{/snippet}
		</GeneralTabs>
	</Card.Root>
{/if}
