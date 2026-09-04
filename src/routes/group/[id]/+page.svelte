<script lang="ts">
	import { page } from "$app/state";
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";
	import {
		getStoredGroup,
		upsertStoredGroup,
		removeStoredGroup,
	} from "$lib/storage";
	import type { StoredGroup } from "$lib/storage";
	import { _, locale } from "$lib/i18n";
	import type { Quote } from "$lib/server/groups";

	const id = page.params.id ?? "";

	let loading = $state(true);
	let notFound = $state(false);
	let needsPassword = $state(false);
	let passwordInput = $state("");
	let passwordErr = $state("");
	let passwordBusy = $state(false);

	let activePassword = $state<string | null>(null);
	let groupName = $state("");
	let quotes = $state<Quote[]>([]);
	let people = $state<string[]>([]);

	let quoteText = $state("");
	let personName = $state("");
	let quotedAt = $state("");
	let searchContent = $state("");
	let searchPerson = $state("");
	let searchBusy = $state(false);
	let addBusy = $state(false);
	let addErr = $state("");

	let copied = $state(false);

	onMount(async () => {
		quotedAt = toDateTimeLocal(new Date());
		const stored = getStoredGroup(id);
		await tryLoad(stored?.password ?? "");
	});

	async function tryLoad(password: string, useSearch = true) {
		loading = true;
		passwordErr = "";
		try {
			const params = new URLSearchParams();
			if (password) params.set("password", password);
			if (useSearch) {
				if (searchContent.trim())
					params.set("content", searchContent.trim());
				if (searchPerson.trim())
					params.set("person", searchPerson.trim());
			}
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
			upsertStoredGroup({
				id,
				name: data.name,
				password: activePassword,
			});
		} catch {
			notFound = true;
		} finally {
			loading = false;
		}
	}

	async function searchQuotes(e: SubmitEvent) {
		e.preventDefault();
		searchBusy = true;
		try {
			await tryLoad(activePassword ?? "");
		} finally {
			searchBusy = false;
		}
	}

	async function clearSearch() {
		searchContent = "";
		searchPerson = "";
		searchBusy = true;
		try {
			await tryLoad(activePassword ?? "", false);
		} finally {
			searchBusy = false;
		}
	}

	async function submitPassword(e: SubmitEvent) {
		e.preventDefault();
		passwordBusy = true;
		passwordErr = "";
		try {
			const params = new URLSearchParams({ password: passwordInput });
			const res = await fetch(`/api/groups/${id}?${params}`);
			const data = await res.json();
			if (res.status === 401) {
				passwordErr = $_("home.wrongPassword");
				return;
			}
			if (!res.ok) {
				passwordErr = data.message || $_("account.somethingWrong");
				return;
			}
			needsPassword = false;
			activePassword = passwordInput;
			groupName = data.name;
			await tryLoad(activePassword ?? "");
			upsertStoredGroup({
				id,
				name: data.name,
				password: activePassword,
			});
		} finally {
			passwordBusy = false;
		}
	}

	async function addQuote(e: SubmitEvent) {
		e.preventDefault();
		addErr = "";
		if (!quoteText.trim()) {
			addErr = $_("group.quoteRequired");
			return;
		}
		const quotedAtDate = new Date(quotedAt);
		if (!quotedAt || Number.isNaN(quotedAtDate.getTime())) {
			addErr = $_("group.dateTimeInvalid");
			return;
		}
		addBusy = true;
		try {
			const res = await fetch(`/api/groups/${id}/quotes`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					password: activePassword,
					text: quoteText,
					person: personName.trim(),
					quotedAt: quotedAtDate.getTime(),
				}),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.message || $_("group.addFailed"));
			await tryLoad(activePassword ?? "");
			quoteText = "";
			personName = "";
			quotedAt = toDateTimeLocal(new Date());
		} catch (err) {
			addErr = err instanceof Error ? err.message : $_("group.addFailed");
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
		if (
			!confirm($_("group.leaveConfirm", { values: { name: groupName } }))
		) {
			return;
		}
		removeStoredGroup(id);
		goto("/");
	}

	function formatDate(ts: number): string {
		return new Date(ts).toLocaleString(
			$locale === "de" ? "de-DE" : "en-US",
			{
				month: "short",
				day: "numeric",
				year: "numeric",
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
			},
		);
	}

	function toDateTimeLocal(date: Date): string {
		const offset = date.getTimezoneOffset();
		const localDate = new Date(date.getTime() - offset * 60_000);
		return localDate.toISOString().slice(0, 19);
	}
</script>

<svelte:head>
	<title>{groupName || $_("group.fallbackTitle")} · {$_("brand")}</title>
</svelte:head>

{#if loading}
	<div class="flex justify-center py-16">
		<span class="loading loading-ring loading-lg text-primary"></span>
	</div>
{:else if notFound}
	<div
		class="rounded-box border border-dashed border-base-300 px-5 py-10 text-center"
	>
		<p class="font-display text-lg">{$_("group.notFound")}</p>
		<p class="mt-1 text-base-content/70">
			{$_("group.checkLink")}
		</p>
		<a href="/" class="btn btn-primary btn-sm mt-4"
			>{$_("group.backHome")}</a
		>
	</div>
{:else if needsPassword}
	<div
		class="mx-auto max-w-sm rounded-box border border-base-300 bg-base-100 p-6"
	>
		<p class="font-display text-lg font-semibold">{groupName}</p>
		<p class="mt-1 text-sm text-base-content/70">
			{$_("group.protected")}
		</p>
		<form class="mt-4 flex flex-col gap-3" onsubmit={submitPassword}>
			<input
				type="password"
				class="input w-full"
				placeholder={$_("group.passwordPlaceholder")}
				bind:value={passwordInput}
			/>
			{#if passwordErr}
				<p class="text-sm text-error">{passwordErr}</p>
			{/if}
			<button class="btn btn-primary" disabled={passwordBusy}>
				{passwordBusy ? $_("group.checking") : $_("group.unlock")}
			</button>
		</form>
	</div>
{:else}
	<div class="mb-6 flex items-start justify-between gap-4">
		<div>
			<h1 class="font-display text-2xl font-semibold">{groupName}</h1>
			<p class="text-sm text-base-content/60">
				{$_("group.quoteCount", {
					values: {
						count: quotes.length,
						s:
							quotes.length === 1
								? $_("group.quoteSuffixOne")
								: $_("group.quoteSuffix"),
					},
				})}
			</p>
		</div>
		<div class="flex shrink-0 gap-2">
			<button class="btn btn-ghost btn-sm" onclick={copyLink}>
				{copied ? $_("group.copied") : $_("group.copyLink")}
			</button>
			<button class="btn btn-ghost btn-sm text-error" onclick={leaveGroup}
				>{$_("group.leave")}</button
			>
		</div>
	</div>

	<form
		class="mb-10 flex flex-col gap-3 rounded-box border border-base-300 bg-base-100 p-5"
		onsubmit={addQuote}
	>
		<label class="fieldset-label" for="quote-text"
			>{$_("group.whatDidTheySay")}</label
		>
		<textarea
			id="quote-text"
			class="textarea w-full"
			rows="2"
			maxlength="1000"
			placeholder={$_("group.quotePlaceholder")}
			bind:value={quoteText}
		></textarea>

		<label class="fieldset-label" for="quote-person"
			>{$_("group.whoSaidIt")}</label
		>
		<input
			id="quote-person"
			class="input w-full"
			list="people-list"
			placeholder={$_("group.personPlaceholder")}
			maxlength="80"
			bind:value={personName}
		/>

		<label class="fieldset-label" for="quote-date-time"
			>{$_("group.dateTime")}</label
		>
		<input
			id="quote-date-time"
			type="datetime-local"
			class="input w-full"
			step="1"
			bind:value={quotedAt}
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
			{addBusy ? $_("group.adding") : $_("group.addQuote")}
		</button>
	</form>

	<form
		class="mb-6 grid gap-3 rounded-box border border-base-300 bg-base-100 p-4 sm:grid-cols-[1fr_1fr_auto]"
		onsubmit={searchQuotes}
	>
		<input
			class="input w-full"
			placeholder={$_("group.searchContent")}
			bind:value={searchContent}
		/>
		<input
			class="input w-full"
			placeholder={$_("group.searchPerson")}
			bind:value={searchPerson}
		/>
		<div class="flex gap-2">
			<button class="btn btn-primary" disabled={searchBusy}
				>{$_("group.search")}</button
			>
			<button
				class="btn btn-ghost"
				type="button"
				disabled={searchBusy}
				onclick={clearSearch}>{$_("group.clearSearch")}</button
			>
		</div>
	</form>

	{#if quotes.length === 0}
		<div
			class="rounded-box border border-dashed border-base-300 px-5 py-10 text-center"
		>
			<p class="text-base-content/70">
				{searchContent || searchPerson
					? $_("group.noMatchingQuotes")
					: $_("group.noQuotes")}
			</p>
		</div>
	{:else}
		<ul class="grid gap-4 sm:grid-cols-2">
			{#each quotes as quote (quote.id)}
				<li class="quote-card rounded-box p-4">
					<p
						class="font-display text-[1.05rem] leading-snug text-balance"
					>
						&ldquo;{quote.text}&rdquo;
					</p>
					<p class="mt-3 text-sm text-base-content/60">
						— {quote.person || $_("group.anonymousPersonDisplay")}
						<span class="text-base-content/40"
							>· {formatDate(quote.quotedAt)}</span
						>
					</p>
				</li>
			{/each}
		</ul>
	{/if}
{/if}
