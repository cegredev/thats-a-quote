<script lang="ts">
	import { onMount } from "svelte";
	import { loadGroups, saveGroups, type StoredGroup } from "$lib/storage";
	import { _ } from "$lib/i18n";
	import { authClient } from "$lib/frontend-auth";

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
		groupCount = loadGroups().length;
	});

	async function mergeVaultIntoStorage(vault: StoredGroup[]) {
		// vault entries from the server never include a fresher name than what
		// we might already have locally, so keep local entries on conflict.
		const local = loadGroups();
		const byId = new Map<string, StoredGroup>(vault.map((g) => [g.id, g]));
		for (const g of local) byId.set(g.id, g);
		const merged = Array.from(byId.values());
		saveGroups(merged);
		groupCount = merged.length;
	}

	async function syncVault({ silent = false }: { silent?: boolean } = {}) {
		if (!silent) {
			busy = true;
			formErr = "";
		}
		try {
			const res = await fetch("/api/auth/sync", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					vault: loadGroups(),
				}),
			});
			const data = await res.json();
			if (!res.ok) {
				if (!silent) formErr = data.message || $_("account.syncFailed");
				return false;
			}
			await mergeVaultIntoStorage(data.vault);
			status = $_("account.status", {
				values: {
					count: data.vault.length,
					s:
						data.vault.length === 1
							? $_("account.groupSuffixOne")
							: $_("account.groupSuffix"),
				},
			});
			return true;
		} catch {
			if (!silent) formErr = $_("account.serverUnavailable");
			return false;
		} finally {
			busy = false;
		}
	}

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		formErr = "";
		if (!username.trim() || !password) {
			formErr = $_("account.fillFields");
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
						user.error.message || $_("account.somethingWrong"),
					);
			} else {
				const user = await authClient.signIn.email({
					email: username,
					password: password,
				});

				if (user.error)
					throw new Error(
						user.error.message || $_("account.somethingWrong"),
					);
			}

			await syncVault();
		} catch (err) {
			formErr =
				err instanceof Error
					? err.message
					: $_("account.somethingWrong");
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
	<title>{$_("syncDevices")} · {$_("brand")}</title>
</svelte:head>

<h1 class="font-display text-2xl font-semibold">
	{$_("account.title")}
</h1>
<p class="mt-2 max-w-lg text-base-content/70">
	{$_("account.intro")}
</p>

{#if $session.data}
	<div
		class="mt-8 max-w-sm rounded-box border border-base-300 bg-base-100 p-6"
	>
		<p class="text-sm text-base-content/60">{$_("account.signedInAs")}</p>
		<p class="font-display text-lg font-semibold">
			{$session.data.user.name}
		</p>
		<p class="mt-3 text-sm text-base-content/70">
			{$_("account.groupsOnDevice", {
				values: {
					count: groupCount,
					s:
						groupCount === 1
							? $_("account.groupSuffixOne")
							: $_("account.groupSuffix"),
				},
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
				{busy ? $_("account.syncing") : $_("account.syncNow")}
			</button>
			<button class="btn btn-ghost btn-sm" onclick={forgetDevice}
				>{$_("account.forget")}</button
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
				{$_("account.login")}
			</button>
			<button
				type="button"
				class="tab {mode === 'register' ? 'tab-active' : ''}"
				onclick={() => (mode = "register")}
			>
				{$_("account.register")}
			</button>
		</div>

		<form class="flex flex-col gap-3" onsubmit={submit}>
			<label class="fieldset-label" for="acct-username"
				>{$_("account.username")}</label
			>
			<input
				id="acct-username"
				class="input w-full"
				bind:value={username}
				maxlength="40"
			/>

			<label class="fieldset-label" for="acct-password"
				>{$_("account.password")}</label
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
				<span class="label-text">{$_("account.remember")}</span>
			</label>

			{#if formErr}
				<p class="text-sm text-error">{formErr}</p>
			{/if}

			<button class="btn btn-primary mt-1 self-start" disabled={busy}>
				{busy
					? $_("account.pleaseWait")
					: mode === "register"
						? $_("account.createAndSync")
						: $_("account.loginAndSync")}
			</button>
		</form>
	</div>
{/if}
