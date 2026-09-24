<script lang="ts">
	import { page } from "$app/state";
	import { goto } from "$app/navigation";
	import { authClient } from "$lib/client/frontend-auth";
	import type { PageProps } from "./$types";
	import { m } from "$lib/paraglide/messages";
	import { Dialog } from "bits-ui";
	import { enhance } from "$app/forms";
	import { groupIDsStore } from "$lib/client/storage.svelte";
	import CreateQuoteForm from "$lib/components/forms/CreateQuoteForm.svelte";
	import CopyButton from "$lib/components/util/CopyButton.svelte";
	import Title from "$lib/components/util/Title.svelte";
	import SearchQuotesForm from "$lib/components/forms/SearchQuotesForm.svelte";
	import QuotesList from "$lib/components/quotes/QuotesList.svelte";

	let { data }: PageProps = $props();

	const session = authClient.useSession();

	const groupId = page.params.id ?? "";

	let leaveDialogOpen: boolean = $state(false);
</script>

<Title
	text={data.group.name ?? `${m["group.fallbackTitle"]()} · {m["brand"]()}`}
/>

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
		<CopyButton
			content={window.location.href}
			copyText={m["group.copyLink"]()}
		/>

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

<SearchQuotesForm />

<QuotesList quotes={data.quotes} />
