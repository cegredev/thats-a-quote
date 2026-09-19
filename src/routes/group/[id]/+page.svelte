<script lang="ts">
	import { page } from "$app/state";
	import { goto } from "$app/navigation";
	import { onMount, untrack } from "svelte";
	import { addStoredGroupID } from "$lib/client/storage";
	import { _, locale } from "$lib/client/i18n";
	import { authClient } from "$lib/client/frontend-auth";
	import { superForm } from "sveltekit-superforms";
	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();

	const session = authClient.useSession();

	const id = page.params.id ?? "";

	const {
		form: quoteCreationForm,
		errors: quoteCreationErrors,
		constraints: quoteCreationConstraints,
		enhance: quoteCreationEnhance,
		submitting: quoteCreationSubmitting,
	} = superForm(
		untrack(() => data.quoteCreationForm),
		{
			delayMs: 300,
		},
	);

	let notFound = $state(false);

	let searchContent = $state("");
	let searchPerson = $state("");
	let searchBusy = $state(false);

	let copied = $state(false);

	$inspect($quoteCreationForm.quotedAt);

	onMount(async () => {
		$quoteCreationForm.quotedAt = toDateTimeLocal(new Date());
		addStoredGroupID(id);
	});

	async function copyLink() {
		await navigator.clipboard.writeText(window.location.href);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}

	async function leaveGroup() {
		if (
			!confirm($_("group.leaveConfirm", { values: { name: groupName } }))
		) {
			return;
		}

		if ($session.data?.user) {
			try {
				await fetch("/api/groups/" + id + "/members", {
					method: "DELETE",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						userId: $session.data.user.id,
					}),
				});
			} catch {
				// Best effort sync: even if the request fails, the local device is
				// already updated and the user has left the group.
			}
		}

		await goto("/");
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
	<title>
		{data.group.name ?? $_("group.fallbackTitle")} · {$_("brand")}
	</title>
</svelte:head>

{#if notFound}
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
{:else}
	<div class="mb-6 flex items-start justify-between gap-4">
		<div>
			<h1 class="font-display text-2xl font-semibold">
				{data.group.name}
			</h1>
			<p class="text-sm text-base-content/60">
				{$_("group.quoteCount", {
					values: {
						count: data.quotes.length,
						s:
							data.quotes.length === 1
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
		method="POST"
		action="?/createQuote"
		use:quoteCreationEnhance
	>
		<label class="fieldset-label" for="text">
			{$_("group.whatDidTheySay")}
		</label>
		<textarea
			class="textarea w-full"
			rows="2"
			placeholder={$_("group.quotePlaceholder")}
			name="text"
			aria-invalid={$quoteCreationErrors.text ? "true" : undefined}
			bind:value={$quoteCreationForm.text}
			{...$quoteCreationConstraints.text}
		></textarea>
		{#if $quoteCreationErrors.text}
			<span class="validator-hint hidden">
				{$quoteCreationErrors.text}
			</span>
		{/if}

		<label class="fieldset-label" for="person">
			{$_("group.whoSaidIt")}
		</label>
		<input
			class="input w-full"
			list="people"
			placeholder={$_("group.personPlaceholder")}
			name="person"
			aria-invalid={$quoteCreationErrors.person ? "true" : undefined}
			bind:value={$quoteCreationForm.person}
			{...$quoteCreationConstraints.person}
		/>
		{#if $quoteCreationErrors.person}
			<span class="validator-hint hidden">
				{$quoteCreationErrors.person}
			</span>
		{/if}
		<datalist id="people">
			{#each data.people as person (person)}
				<option value={person}></option>
			{/each}
		</datalist>

		<label class="fieldset-label" for="quote-date-time"
			>{$_("group.dateTime")}</label
		>
		<input
			type="datetime-local"
			class="input w-full"
			step="1"
			name="quotedAt"
			aria-invalid={$quoteCreationErrors.quotedAt ? "true" : undefined}
			bind:value={$quoteCreationForm.quotedAt}
			{...$quoteCreationConstraints.quotedAt}
		/>
		{#if $quoteCreationErrors.quotedAt}
			<span class="validator-hint hidden">
				{$quoteCreationErrors.quotedAt}
			</span>
		{/if}

		<button
			class="btn btn-primary mt-1 self-start"
			disabled={$quoteCreationSubmitting}
		>
			{$quoteCreationSubmitting
				? $_("group.adding")
				: $_("group.addQuote")}
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

	{#if data.quotes.length === 0}
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
			{#each data.quotes as quote (quote.id)}
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
