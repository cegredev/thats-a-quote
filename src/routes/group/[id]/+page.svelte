<script lang="ts">
	import { page } from "$app/state";
	import { goto } from "$app/navigation";
	import { onMount, untrack } from "svelte";
	import { authClient } from "$lib/client/frontend-auth";
	import { superForm } from "sveltekit-superforms";
	import type { PageProps } from "./$types";
	import { m } from "$lib/paraglide/messages";
	import { getLocale } from "$lib/paraglide/runtime";
	import { Dialog } from "bits-ui";
	import { enhance } from "$app/forms";
	import { groupIDsStore } from "$lib/client/storage.svelte";
	import CreateQuoteForm from "$lib/components/forms/CreateQuoteForm.svelte";

	let { data }: PageProps = $props();

	const session = authClient.useSession();

	const groupId = page.params.id ?? "";

	let copied = $state(false);

	async function copyLink() {
		await navigator.clipboard.writeText(window.location.href);
		copied = true;
		setTimeout(() => (copied = false), 1500);
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

		{#if groupIDsStore.has(groupId) || leaveDialogOpen}
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
									type={$session.data?.user
										? "submit"
										: "button"}
									class="btn btn-error"
									onclick={async () => {
										groupIDsStore.remove(groupId);

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
		{:else}
			<form method="POST" action="?/joinGroup" use:enhance>
				<button
					type={$session.data?.user ? "submit" : "button"}
					class="btn btn-ghost btn-sm text-success"
					onclick={() =>
						setTimeout(() => groupIDsStore.add(groupId), 100)}
				>
					{m["group.join"]()}
				</button>
			</form>
		{/if}
	</div>
</div>

<CreateQuoteForm form={data.quoteCreationForm} />

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
