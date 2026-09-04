<script>
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { getStoredGroup, upsertStoredGroup, removeStoredGroup } from '$lib/storage.js';

	const id = page.params.id;

	let loading = $state(true);
	let notFound = $state(false);
	let needsPassword = $state(false);
	let passwordInput = $state('');
	let passwordErr = $state('');
	let passwordBusy = $state(false);

	let activePassword = $state(null);
	let groupName = $state('');
	let quotes = $state([]);
	let people = $state([]);

	let quoteText = $state('');
	let personName = $state('');
	let addBusy = $state(false);
	let addErr = $state('');

	let copied = $state(false);

	onMount(async () => {
		const stored = getStoredGroup(id);
		await tryLoad(stored?.password ?? '');
	});

	async function tryLoad(password) {
		loading = true;
		passwordErr = '';
		try {
			const params = new URLSearchParams();
			if (password) params.set('password', password);
			const res = await fetch(`/api/groups/${id}?${params}`);

			if (res.status === 404) {
				notFound = true;
				return;
			}

			const data = await res.json();

			if (res.status === 401) {
				needsPassword = true;
				groupName = data.name;
				return;
			}

			needsPassword = false;
			activePassword = password || null;
			groupName = data.name;
			quotes = data.quotes;
			people = data.people;
			upsertStoredGroup({ id, name: data.name, password: activePassword });
		} catch {
			notFound = true;
		} finally {
			loading = false;
		}
	}

	async function submitPassword(e) {
		e.preventDefault();
		passwordBusy = true;
		passwordErr = '';
		try {
			const params = new URLSearchParams({ password: passwordInput });
			const res = await fetch(`/api/groups/${id}?${params}`);
			const data = await res.json();
			if (res.status === 401) {
				passwordErr = 'That password is incorrect.';
				return;
			}
			if (!res.ok) {
				passwordErr = data.message || 'Something went wrong.';
				return;
			}
			needsPassword = false;
			activePassword = passwordInput;
			groupName = data.name;
			quotes = data.quotes;
			people = data.people;
			upsertStoredGroup({ id, name: data.name, password: activePassword });
		} finally {
			passwordBusy = false;
		}
	}

	async function addQuote(e) {
		e.preventDefault();
		addErr = '';
		if (!quoteText.trim()) {
			addErr = 'The quote cannot be empty.';
			return;
		}
		if (!personName.trim()) {
			addErr = 'Who said it?';
			return;
		}
		addBusy = true;
		try {
			const res = await fetch(`/api/groups/${id}/quotes`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					password: activePassword,
					text: quoteText,
					person: personName
				})
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.message || 'Could not add that quote.');
			quotes = data.quotes;
			people = data.people;
			quoteText = '';
			personName = '';
		} catch (err) {
			addErr = err.message;
		} finally {
			addBusy = false;
		}
	}

	async function copyLink() {
		await navigator.clipboard.writeText(window.location.href);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}

	function leaveGroup() {
		if (!confirm(`Remove "${groupName}" from this device? The group and its quotes stay online.`)) {
			return;
		}
		removeStoredGroup(id);
		goto('/');
	}

	function formatDate(ts) {
		return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
	}
</script>

<svelte:head>
	<title>{groupName || 'Group'} · Quotebook</title>
</svelte:head>

{#if loading}
	<div class="flex justify-center py-16">
		<span class="loading loading-ring loading-lg text-primary"></span>
	</div>
{:else if notFound}
	<div class="rounded-box border border-dashed border-base-300 px-5 py-10 text-center">
		<p class="font-display text-lg">This group doesn't exist.</p>
		<p class="mt-1 text-base-content/70">Double check the link, or head back home.</p>
		<a href="/" class="btn btn-primary btn-sm mt-4">Back to Quotebook</a>
	</div>
{:else if needsPassword}
	<div class="mx-auto max-w-sm rounded-box border border-base-300 bg-base-100 p-6">
		<p class="font-display text-lg font-semibold">{groupName}</p>
		<p class="mt-1 text-sm text-base-content/70">This group is password protected.</p>
		<form class="mt-4 flex flex-col gap-3" onsubmit={submitPassword}>
			<input
				type="password"
				class="input w-full"
				placeholder="Password"
				bind:value={passwordInput}
			/>
			{#if passwordErr}
				<p class="text-sm text-error">{passwordErr}</p>
			{/if}
			<button class="btn btn-primary" disabled={passwordBusy}>
				{passwordBusy ? 'Checking…' : 'Unlock'}
			</button>
		</form>
	</div>
{:else}
	<div class="mb-6 flex items-start justify-between gap-4">
		<div>
			<h1 class="font-display text-2xl font-semibold">{groupName}</h1>
			<p class="text-sm text-base-content/60">
				{quotes.length} quote{quotes.length === 1 ? '' : 's'}
			</p>
		</div>
		<div class="flex shrink-0 gap-2">
			<button class="btn btn-ghost btn-sm" onclick={copyLink}>
				{copied ? 'Copied!' : 'Copy invite link'}
			</button>
			<button class="btn btn-ghost btn-sm text-error" onclick={leaveGroup}>Leave</button>
		</div>
	</div>

	<form
		class="mb-10 flex flex-col gap-3 rounded-box border border-base-300 bg-base-100 p-5"
		onsubmit={addQuote}
	>
		<label class="fieldset-label" for="quote-text">What did they say?</label>
		<textarea
			id="quote-text"
			class="textarea w-full"
			rows="2"
			maxlength="1000"
			placeholder={`"I'm not saying it was aliens, but it was aliens."`}
			bind:value={quoteText}
		></textarea>

		<label class="fieldset-label" for="quote-person">Who said it?</label>
		<input
			id="quote-person"
			class="input w-full"
			list="people-list"
			placeholder="Start typing a name…"
			maxlength="80"
			bind:value={personName}
		/>
		<datalist id="people-list">
			{#each people as person (person)}
				<option value={person}></option>
			{/each}
		</datalist>

		{#if addErr}
			<p class="text-sm text-error">{addErr}</p>
		{/if}

		<button class="btn btn-primary mt-1 self-start" disabled={addBusy}>
			{addBusy ? 'Adding…' : 'Add quote'}
		</button>
	</form>

	{#if quotes.length === 0}
		<div class="rounded-box border border-dashed border-base-300 px-5 py-10 text-center">
			<p class="text-base-content/70">No quotes yet. Be the first to add one above.</p>
		</div>
	{:else}
		<ul class="grid gap-4 sm:grid-cols-2">
			{#each quotes as quote (quote.id)}
				<li class="quote-card rounded-box p-4">
					<p class="font-display text-[1.05rem] leading-snug text-balance">
						&ldquo;{quote.text}&rdquo;
					</p>
					<p class="mt-3 text-sm text-base-content/60">
						— {quote.person} <span class="text-base-content/40">· {formatDate(quote.createdAt)}</span>
					</p>
				</li>
			{/each}
		</ul>
	{/if}
{/if}
