<script lang="ts">
	import { page } from "$app/state";
	import { goto } from "$app/navigation";
	import { onMount, untrack } from "svelte";
	import { addStoredGroupID, removeStoredGroupID } from "$lib/client/storage";
	import { authClient } from "$lib/client/frontend-auth";
	import { superForm } from "sveltekit-superforms";
	import type { PageProps } from "./$types";
	import { m } from "$lib/paraglide/messages";
	import { getLocale } from "$lib/paraglide/runtime";
	import { Dialog } from "bits-ui";
	import { enhance } from "$app/forms";

	let { data }: PageProps = $props();

	const session = authClient.useSession();

	const groupId = page.params.id ?? "";

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

	let copied = $state(false);

	onMount(async () => {
		$quoteCreationForm.quotedAt = toDateTimeLocal(new Date());
		addStoredGroupID(groupId);
	});

	async function copyLink() {
		await navigator.clipboard.writeText(window.location.href);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}

	async function leaveGroup() {
		if ($session.data?.user) {
			try {
				await fetch("/api/groups/" + groupId + "/members", {
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
			getLocale() === "de" ? "de-DE" : "en-US",
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

	let searchQueryExists = $derived(page.url.searchParams.size > 0);

	let leaveDialogOpen: boolean = $state(false);
</script>

<svelte:head>
	<title>
		{data.group.name ?? m["group.fallbackTitle"]()} · {m["brand"]()}
	</title>
</svelte:head>

<div class="mb-6 flex items-start justify-between gap-4">
	<div>
		<h1 class="font-display text-2xl font-semibold">
			{data.group.name}
		</h1>
		<p class="text-sm text-base-content/60">
			{m["group.quoteCount"]({
				count: data.quotes.length,
				s:
					data.quotes.length === 1
						? m["group.quoteSuffixOne"]()
						: m["group.quoteSuffix"](),
			})}
		</p>
	</div>

	<div class="flex shrink-0 gap-2">
		<button class="btn btn-ghost btn-sm" onclick={copyLink}>
			{copied ? m["group.copied"]() : m["group.copyLink"]()}
		</button>

		<script lang="ts">
			import { Dialog } from "bits-ui";

			let open = $state(false);
		</script>

		<Dialog.Root bind:open={leaveDialogOpen}>
			<Dialog.Trigger class="btn btn-ghost btn-sm text-error">
				{m["group.leave"]()}
			</Dialog.Trigger>

			<Dialog.Portal>
				<Dialog.Overlay class="fixed inset-0 z-50 bg-black/50" />

				<Dialog.Content
					class="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-lg
			       -translate-x-1/2 -translate-y-1/2
			       rounded-box bg-base-100 p-6 shadow-2xl"
				>
					<Dialog.Title class="text-xl font-bold">
						Leave group?
					</Dialog.Title>

					<Dialog.Description class="mt-2 text-base-content/70">
						{m["group.leaveConfirm"]({ name: data.group.name })}
					</Dialog.Description>

					<div class="mt-6 flex justify-end gap-2">
						<Dialog.Close class="btn btn-ghost">
							Cancel
						</Dialog.Close>

						<form
							method="POST"
							action="?/leaveGroup"
							use:enhance={async () => {
								return async ({ result, update }) => {
									await update();

									if (result.type === "success") {
										leaveDialogOpen = false;

										await goto("..");
									}
								};
							}}
						>
							<button
								type={$session.data?.user ? "submit" : "button"}
								class="btn btn-error"
								onclick={async () => {
									removeStoredGroupID(groupId);

									if (!$session.data?.user) {
										leaveDialogOpen = false;

										await goto("..");
									}
								}}
							>
								{m["group.leave"]()}
							</button>
						</form>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	</div>
</div>

<form
	class="mb-10 flex flex-col gap-3 rounded-box border border-base-300 bg-base-100 p-5"
	method="POST"
	action="?/createQuote"
	use:quoteCreationEnhance
>
	<label class="fieldset-label" for="text">
		{m["group.whatDidTheySay"]()}
	</label>
	<textarea
		class="textarea w-full"
		rows="2"
		placeholder={m["group.quotePlaceholder"]()}
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
		{m["group.whoSaidIt"]()}
	</label>
	<input
		class="input w-full"
		list="people"
		placeholder={m["group.personPlaceholder"]()}
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
		>{m["group.dateTime"]()}</label
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
		{$quoteCreationSubmitting ? m["group.adding"]() : m["group.addQuote"]()}
	</button>
</form>

<form
	class="mb-6 grid gap-3 rounded-box border border-base-300 bg-base-100 p-4 sm:grid-cols-[1fr_1fr_auto]"
	method="GET"
>
	<input
		class="input w-full"
		placeholder={m["group.searchContent"]()}
		name="text"
		value={page.url.searchParams.get("text") ?? ""}
	/>
	<input
		class="input w-full"
		placeholder={m["group.searchPerson"]()}
		name="person"
		value={page.url.searchParams.get("person") ?? ""}
	/>
	<div class="flex gap-2">
		<button class="btn btn-primary">{m["group.search"]()}</button>
		<a class="btn btn-ghost" type="button" href={page.url.pathname}>
			Clear
		</a>
	</div>
</form>

{#if data.quotes.length === 0}
	<div
		class="rounded-box border border-dashed border-base-300 px-5 py-10 textsearchContent || searchPerson-center"
	>
		<p class="text-base-content/70">
			{searchQueryExists
				? m["group.noMatchingQuotes"]()
				: m["group.noQuotes"]()}
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
					— {quote.person || m["group.anonymousPersonDisplay"]()}
					<span class="text-base-content/40">
						· {formatDate(quote.quotedAt)}
					</span>
				</p>
			</li>
		{/each}
	</ul>
{/if}
