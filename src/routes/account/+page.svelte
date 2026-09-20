<script lang="ts">
	import { onMount } from "svelte";
	import { readStoredGroupIDs } from "$lib/client/storage";
	import { authClient } from "$lib/client/frontend-auth";
	import { m } from "$lib/paraglide/messages";

	const session = authClient.useSession();

	let remember = $state(true);

	let mode = $state("login"); // 'login' | 'register'
	let username = $state("");
	let password = $state("");
	let busy = $state(false);
	let formErr = $state("");

	let status = $state(""); // last sync status message
	let groupCount = $state(0);

	onMount(async () => {
		groupCount = readStoredGroupIDs().length;
	});

	async function syncVault({ silent = false }: { silent?: boolean } = {}) {
		if (!silent) {
			busy = true;
			formErr = "";
		}
		try {
			const res = await fetch("/api/sync", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					vault: readStoredGroupIDs(),
				}),
			});
			const data = await res.json();
			if (!res.ok) {
				if (!silent)
					formErr = data.message || m["account.syncFailed"]();
				return false;
			}

			return true;
		} catch {
			if (!silent) formErr = m["account.serverUnavailable"]();
			return false;
		} finally {
			busy = false;
		}
	}

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		formErr = "";
		if (!username.trim() || !password) {
			formErr = m["account.fillFields"]();
			return;
		}
		busy = true;
		try {
			if (mode === "register") {
				const user = await authClient.signUp.email({
					email: username,
					password: password,
					name: username,
				});

				if (user.error)
					throw new Error(
						user.error.message || m["account.somethingWrong"](),
					);
			} else {
				const user = await authClient.signIn.email({
					email: username,
					password: password,
				});

				if (user.error)
					throw new Error(
						user.error.message || m["account.somethingWrong"](),
					);
			}

			await syncVault();
		} catch (err) {
			formErr =
				err instanceof Error
					? err.message
					: m["account.somethingWrong"]();
		} finally {
			busy = false;
		}
	}

	async function forgetDevice() {
		await authClient.signOut();
		status = "";
		username = "";
		password = "";
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
		<p class="mt-3 text-sm text-base-content/70">
			{m["account.groupsOnDevice"]({
				count: groupCount,
				s:
					groupCount === 1
						? m["account.groupSuffixOne"]()
						: m["account.groupSuffix"](),
			})}
		</p>
		{#if status}
			<p class="mt-1 text-sm text-success">{status}</p>
		{/if}
		<div class="mt-5 flex gap-2">
			<button
				class="btn btn-primary btn-sm"
				disabled={busy}
				onclick={() => {
					syncVault();
				}}
			>
				{busy ? m["account.syncing"]() : m["account.syncNow"]()}
			</button>
			<button class="btn btn-ghost btn-sm" onclick={forgetDevice}
				>{m["account.forget"]()}</button
			>
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

		<form class="flex flex-col gap-3" onsubmit={submit}>
			<label class="fieldset-label" for="acct-username"
				>{m["account.username"]()}</label
			>
			<input
				id="acct-username"
				class="input w-full"
				bind:value={username}
				maxlength="40"
			/>

			<label class="fieldset-label" for="acct-password"
				>{m["account.password"]()}</label
			>
			<input
				id="acct-password"
				type="password"
				class="input w-full"
				bind:value={password}
				minlength="6"
			/>

			<label class="label cursor-pointer justify-start gap-2 px-0">
				<input
					type="checkbox"
					class="checkbox checkbox-sm"
					bind:checked={remember}
				/>
				<span class="label-text">{m["account.remember"]()}</span>
			</label>

			{#if formErr}
				<p class="text-sm text-error">{formErr}</p>
			{/if}

			<button class="btn btn-primary mt-1 self-start" disabled={busy}>
				{busy
					? m["account.pleaseWait"]()
					: mode === "register"
						? m["account.createAndSync"]()
						: m["account.loginAndSync"]()}
			</button>
		</form>
	</div>
{/if}
