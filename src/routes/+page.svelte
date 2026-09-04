<script>
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";
	import { loadGroups, upsertStoredGroup } from "$lib/storage.js";
	import { _ } from "$lib/i18n.js";

	let groups = $state([]);
	let mode = $state("create"); // 'create' | 'join'

	let createName = $state("");
	let createPassword = $state("");
	let createBusy = $state(false);
	let createErr = $state("");

	let joinId = $state("");
	let joinPassword = $state("");
	let joinBusy = $state(false);
	let joinErr = $state("");

	onMount(() => {
		groups = loadGroups();
	});

	async function createGroup(e) {
		e.preventDefault();
		createErr = "";
		if (!createName.trim()) {
			createErr = $_("home.nameRequired");
			return;
		}
		createBusy = true;
		try {
			const res = await fetch("/api/groups", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: createName,
					password: createPassword,
				}),
			});
			const data = await res.json();
			if (!res.ok)
				throw new Error(data.message || $_("home.createFailed"));
			upsertStoredGroup({
				id: data.id,
				name: data.name,
				password: createPassword.trim() || null,
			});
			goto(`/group/${data.id}`);
		} catch (err) {
			createErr = err.message;
		} finally {
			createBusy = false;
		}
	}

	async function joinGroup(e) {
		e.preventDefault();
		joinErr = "";
		const id = extractId(joinId.trim());
		if (!id) {
			joinErr = $_("home.linkRequired");
			return;
		}
		joinBusy = true;
		try {
			const params = new URLSearchParams();
			if (joinPassword) params.set("password", joinPassword);
			const res = await fetch(`/api/groups/${id}?${params}`);
			const data = await res.json();
			if (res.status === 404) throw new Error($_("home.notFound"));
			if (res.status === 401) throw new Error($_("home.wrongPassword"));
			if (!res.ok) throw new Error(data.message || $_("home.joinFailed"));
			upsertStoredGroup({
				id,
				name: data.name,
				password: joinPassword.trim() || null,
			});
			goto(`/group/${id}`);
		} catch (err) {
			joinErr = err.message;
		} finally {
			joinBusy = false;
		}
	}

	function extractId(input) {
		if (!input) return "";
		try {
			const url = new URL(input);
			const parts = url.pathname.split("/").filter(Boolean);
			return parts[parts.length - 1] || "";
		} catch {
			return input;
		}
	}
</script>

<svelte:head>
	<title>{$_("brand")}</title>
</svelte:head>

<section class="mb-10">
	<h1 class="font-display text-3xl leading-tight font-semibold text-balance">
		{$_("home.title")}
	</h1>
	<p class="mt-3 max-w-lg text-base-content/70">
		{$_("home.intro")}
	</p>
</section>

<section class="mb-12">
	<h2 class="mb-3 font-display text-lg font-semibold">
		{$_("home.yourGroups")}
	</h2>

	{#if groups.length === 0}
		<div
			class="rounded-box border border-dashed border-base-300 px-5 py-8 text-center"
		>
			<p class="text-base-content/70">
				{$_("home.empty")}
			</p>
		</div>
	{:else}
		<ul class="flex flex-col gap-2">
			{#each groups as group (group.id)}
				<li>
					<a
						href={`/group/${group.id}`}
						class="flex items-center justify-between rounded-box border border-base-300 bg-base-100 px-4 py-3 transition hover:border-primary/50 hover:bg-base-200"
					>
						<span class="font-medium">{group.name}</span>
						{#if group.password}
							<span class="badge badge-ghost badge-sm gap-1">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="currentColor"
									class="h-3 w-3"
								>
									<path
										fill-rule="evenodd"
										d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3h-.75a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-6a3 3 0 0 0-3-3h-.75v-3A5.25 5.25 0 0 0 12 1.5Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z"
										clip-rule="evenodd"
									/>
								</svg>
								{$_("home.locked")}
							</span>
						{/if}
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</section>

<section class="rounded-box border border-base-300 bg-base-100 p-5">
	<div class="tabs tabs-box mb-5 w-fit">
		<button
			type="button"
			class="tab {mode === 'create' ? 'tab-active' : ''}"
			onclick={() => (mode = "create")}
		>
			{$_("home.createTab")}
		</button>
		<button
			type="button"
			class="tab {mode === 'join' ? 'tab-active' : ''}"
			onclick={() => (mode = "join")}
		>
			{$_("home.joinTab")}
		</button>
	</div>

	{#if mode === "create"}
		<form class="flex flex-col gap-3" onsubmit={createGroup}>
			<label class="fieldset-label" for="create-name"
				>{$_("home.groupName")}</label
			>
			<input
				id="create-name"
				class="input w-full"
				placeholder={$_("home.groupNamePlaceholder")}
				bind:value={createName}
				maxlength="80"
			/>
			<label class="fieldset-label" for="create-password">
				{$_("home.password")}
				<span class="text-base-content/50">({$_("home.optional")})</span
				>
			</label>
			<input
				id="create-password"
				type="password"
				class="input w-full"
				placeholder={$_("home.openGroupPlaceholder")}
				bind:value={createPassword}
			/>
			{#if createErr}
				<p class="text-sm text-error">{createErr}</p>
			{/if}
			<button
				class="btn btn-primary mt-1 self-start"
				disabled={createBusy}
			>
				{createBusy ? $_("home.createBusy") : $_("home.create")}
			</button>
		</form>
	{:else}
		<form class="flex flex-col gap-3" onsubmit={joinGroup}>
			<label class="fieldset-label" for="join-id"
				>{$_("home.groupLinkOrId")}</label
			>
			<input
				id="join-id"
				class="input w-full"
				placeholder={$_("home.linkPlaceholder")}
				bind:value={joinId}
			/>
			<label class="fieldset-label" for="join-password">
				{$_("home.password")}
				<span class="text-base-content/50">({$_("home.ifHasOne")})</span
				>
			</label>
			<input
				id="join-password"
				type="password"
				class="input w-full"
				bind:value={joinPassword}
			/>
			{#if joinErr}
				<p class="text-sm text-error">{joinErr}</p>
			{/if}
			<button class="btn btn-primary mt-1 self-start" disabled={joinBusy}>
				{joinBusy ? $_("home.joinBusy") : $_("home.join")}
			</button>
		</form>
	{/if}
</section>
