<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { loadGroups, upsertStoredGroup } from '$lib/storage.js';

	let groups = $state([]);
	let mode = $state('create'); // 'create' | 'join'

	let createName = $state('');
	let createPassword = $state('');
	let createBusy = $state(false);
	let createErr = $state('');

	let joinId = $state('');
	let joinPassword = $state('');
	let joinBusy = $state(false);
	let joinErr = $state('');

	onMount(() => {
		groups = loadGroups();
	});

	async function createGroup(e) {
		e.preventDefault();
		createErr = '';
		if (!createName.trim()) {
			createErr = 'Give your group a name first.';
			return;
		}
		createBusy = true;
		try {
			const res = await fetch('/api/groups', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: createName, password: createPassword })
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.message || 'Could not create the group.');
			upsertStoredGroup({
				id: data.id,
				name: data.name,
				password: createPassword.trim() || null
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
		joinErr = '';
		const id = extractId(joinId.trim());
		if (!id) {
			joinErr = 'Paste the group link or ID you were given.';
			return;
		}
		joinBusy = true;
		try {
			const params = new URLSearchParams();
			if (joinPassword) params.set('password', joinPassword);
			const res = await fetch(`/api/groups/${id}?${params}`);
			const data = await res.json();
			if (res.status === 404) throw new Error("That group doesn't exist. Check the link.");
			if (res.status === 401) throw new Error('That password is incorrect.');
			if (!res.ok) throw new Error(data.message || 'Could not join the group.');
			upsertStoredGroup({ id, name: data.name, password: joinPassword.trim() || null });
			goto(`/group/${id}`);
		} catch (err) {
			joinErr = err.message;
		} finally {
			joinBusy = false;
		}
	}

	function extractId(input) {
		if (!input) return '';
		try {
			const url = new URL(input);
			const parts = url.pathname.split('/').filter(Boolean);
			return parts[parts.length - 1] || '';
		} catch {
			return input;
		}
	}
</script>

<svelte:head>
	<title>Quotebook</title>
</svelte:head>

<section class="mb-10">
	<h1 class="font-display text-3xl leading-tight font-semibold text-balance">
		The funny things your friends say, kept somewhere safe.
	</h1>
	<p class="mt-3 max-w-lg text-base-content/70">
		Make a group, share the link, and let everyone add the quotes worth remembering. No accounts
		needed — everything lives in this browser unless you choose to sync it.
	</p>
</section>

<section class="mb-12">
	<h2 class="mb-3 font-display text-lg font-semibold">Your groups</h2>

	{#if groups.length === 0}
		<div class="rounded-box border border-dashed border-base-300 px-5 py-8 text-center">
			<p class="text-base-content/70">
				You haven't joined any groups on this device yet. Create one, or join an existing group
				with a link.
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
								Locked
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
			onclick={() => (mode = 'create')}
		>
			Create a group
		</button>
		<button
			type="button"
			class="tab {mode === 'join' ? 'tab-active' : ''}"
			onclick={() => (mode = 'join')}
		>
			Join a group
		</button>
	</div>

	{#if mode === 'create'}
		<form class="flex flex-col gap-3" onsubmit={createGroup}>
			<label class="fieldset-label" for="create-name">Group name</label>
			<input
				id="create-name"
				class="input w-full"
				placeholder="The Thursday Hiking Crew"
				bind:value={createName}
				maxlength="80"
			/>
			<label class="fieldset-label" for="create-password">
				Password <span class="text-base-content/50">(optional)</span>
			</label>
			<input
				id="create-password"
				type="password"
				class="input w-full"
				placeholder="Leave blank for an open group"
				bind:value={createPassword}
			/>
			{#if createErr}
				<p class="text-sm text-error">{createErr}</p>
			{/if}
			<button class="btn btn-primary mt-1 self-start" disabled={createBusy}>
				{createBusy ? 'Creating…' : 'Create group'}
			</button>
		</form>
	{:else}
		<form class="flex flex-col gap-3" onsubmit={joinGroup}>
			<label class="fieldset-label" for="join-id">Group link or ID</label>
			<input
				id="join-id"
				class="input w-full"
				placeholder="Paste the link a friend sent you"
				bind:value={joinId}
			/>
			<label class="fieldset-label" for="join-password">
				Password <span class="text-base-content/50">(if it has one)</span>
			</label>
			<input id="join-password" type="password" class="input w-full" bind:value={joinPassword} />
			{#if joinErr}
				<p class="text-sm text-error">{joinErr}</p>
			{/if}
			<button class="btn btn-primary mt-1 self-start" disabled={joinBusy}>
				{joinBusy ? 'Joining…' : 'Join group'}
			</button>
		</form>
	{/if}
</section>
