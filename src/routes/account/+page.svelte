<script lang="ts">
	import { authClient } from "$lib/client/frontend-auth";
	import { m } from "$lib/paraglide/messages";
	import { superForm } from "sveltekit-superforms";
	import { untrack } from "svelte";
	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();

	const session = authClient.useSession();

	let mode: "login" | "register" = $state("login");

	const {
		form: registerForm,
		errors: registerErrors,
		constraints: registerConstraints,
		enhance: registerEnhance,
		submitting: registerSubmitting,
	} = superForm(
		untrack(() => data.registerForm),
		{
			delayMs: 300,
			onResult: async ({ result }) => {
				if (result.type === "success") {
					await $session.refetch();
				}
			},
		},
	);

	const {
		form: loginForm,
		errors: loginErrors,
		constraints: loginConstraints,
		enhance: loginEnhance,
		submitting: loginSubmitting,
	} = superForm(
		untrack(() => data.loginForm),
		{
			delayMs: 300,
			onResult: async ({ result }) => {
				if (result.type === "success") {
					await $session.refetch();
				}
			},
		},
	);

	async function forgetDevice() {
		await authClient.signOut();
	}
</script>

<svelte:head>
	<title>{m["syncDevices"]()} · {m["brand"]()}</title>
</svelte:head>

<h1 class="font-display text-2xl font-semibold">
	{m["account.title"]()}
</h1>
<p class="mt-2 max-w-lg text-base-content/70">
	{m["account.intro"]()}
</p>

{#if $session.data}
	<div
		class="mt-8 max-w-sm rounded-box border border-base-300 bg-base-100 p-6"
	>
		<p class="text-sm text-base-content/60">{m["account.signedInAs"]()}</p>
		<p class="font-display text-lg font-semibold">
			{$session.data.user.name}
		</p>
		<div class="mt-5 flex gap-2">
			<button class="btn btn-ghost btn-sm" onclick={forgetDevice}>
				{m["account.forget"]()}
			</button>
		</div>
	</div>
{:else}
	<div
		class="mt-8 max-w-sm rounded-box border border-base-300 bg-base-100 p-6"
	>
		<div class="tabs tabs-box mb-5 w-fit">
			<button
				type="button"
				class="tab {mode === 'login' ? 'tab-active' : ''}"
				onclick={() => (mode = "login")}
			>
				{m["account.login"]()}
			</button>
			<button
				type="button"
				class="tab {mode === 'register' ? 'tab-active' : ''}"
				onclick={() => (mode = "register")}
			>
				{m["account.register"]()}
			</button>
		</div>

		{#if mode === "register"}
			<form
				class="flex flex-col gap-3"
				method="POST"
				action="?/register"
				use:registerEnhance
			>
				<label class="fieldset-label" for="name">Name</label>
				<input
					type="text"
					name="name"
					class="input w-full validator"
					aria-invalid={$registerErrors.name ? "true" : undefined}
					bind:value={$registerForm.name}
					{...$registerConstraints.name}
				/>
				{#if $registerErrors.name}
					<span class="validator-hint hidden">
						{$registerErrors.name}
					</span>
				{/if}

				<label class="fieldset-label" for="email">
					{m["account.username"]()}
				</label>
				<!-- FIXME Email constraints don't work, maybe a bug in superforms or zod -->
				<input
					type="email"
					name="email"
					class="input w-full validator"
					aria-invalid={$registerErrors.email ? "true" : undefined}
					bind:value={$registerForm.email}
				/>
				{#if $registerErrors.email}
					<span class="validator-hint hidden">
						{$registerErrors.email}
					</span>
				{/if}

				<label class="fieldset-label" for="password">Password</label>
				<input
					type="password"
					name="password"
					class="input w-full validator"
					aria-invalid={$registerErrors.password ? "true" : undefined}
					bind:value={$registerForm.password}
					{...$registerConstraints.password}
				/>
				{#if $registerErrors.password}
					<span class="validator-hint hidden">
						{$registerErrors.password}
					</span>
				{/if}

				<button
					class="btn btn-primary mt-1 self-start"
					disabled={$registerSubmitting}
				>
					{$registerSubmitting ? "Signing up..." : "Sign up"}
				</button>
			</form>
		{:else}
			<form
				class="flex flex-col gap-3"
				method="POST"
				action="?/login"
				use:loginEnhance
			>
				<label class="fieldset-label" for="email">
					{m["account.username"]()}
				</label>
				<!-- FIXME Email constraints don't work, maybe a bug in superforms or zod -->
				<input
					type="email"
					name="email"
					class="input w-full validator"
					aria-invalid={$loginErrors.email ? "true" : undefined}
					bind:value={$loginForm.email}
				/>
				{#if $loginErrors.email}
					<span class="validator-hint hidden">
						{$loginErrors.email}
					</span>
				{/if}

				<label class="fieldset-label" for="password">Password</label>
				<input
					type="password"
					name="password"
					class="input w-full validator"
					aria-invalid={$loginErrors.password ? "true" : undefined}
					bind:value={$loginForm.password}
					{...$loginConstraints.password}
				/>
				{#if $loginErrors.password}
					<span class="validator-hint hidden">
						{$loginErrors.password}
					</span>
				{/if}

				{#if $loginErrors._errors}
					<span class="text-error">
						{$loginErrors._errors[0]}
					</span>
				{/if}

				<button
					class="btn btn-primary mt-1 self-start"
					disabled={$loginSubmitting}
				>
					{$loginSubmitting ? "Logging in..." : "Log in"}
				</button>
			</form>
		{/if}
	</div>
{/if}
