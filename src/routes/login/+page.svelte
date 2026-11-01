<script lang="ts">
	import AuthPage from "#lib/components/AuthPage.svelte";
	import LoginForm from "#lib/components/forms/LoginForm.svelte";
	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();
</script>

<AuthPage switchHref="/signup" switchLabel="Don't have an account?">
	{#snippet children()}
		<LoginForm form={data.loginForm} />
	{/snippet}
</AuthPage>
