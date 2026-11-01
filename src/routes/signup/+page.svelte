<script lang="ts">
	import AuthPage from "#lib/components/AuthPage.svelte";
	import RegisterForm from "#lib/components/forms/RegisterForm.svelte";
	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();
</script>

<AuthPage switchHref="/login" switchLabel="Already have an account?">
	{#snippet children()}
		<RegisterForm form={data.registerForm} />
	{/snippet}
</AuthPage>
