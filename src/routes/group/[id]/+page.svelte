<script lang="ts">
	import { page } from "$app/state";
	import { goto } from "$app/navigation";
	import type { PageProps } from "./$types";
	import { m } from "$lib/paraglide/messages";
	import { groupIDsStore } from "$lib/client/storage.svelte";
	import CreateQuoteForm from "$lib/components/forms/CreateQuoteForm.svelte";
	import CopyButton from "$lib/components/util/CopyButton.svelte";
	import Title from "$lib/components/util/Title.svelte";
	import SearchQuotesForm from "$lib/components/forms/SearchQuotesForm.svelte";
	import QuotesList from "$lib/components/quotes/QuotesList.svelte";
	import FormButton from "$lib/components/forms/FormButton.svelte";
	import classNames from "classnames";
	import { onMount } from "svelte";
	import GenericDialog from "$lib/components/dialogs/GenericDialog.svelte";

	let { data }: PageProps = $props();

	const groupId = page.params.id ?? "";

	onMount(() => {
		if (data.userIsMember) {
			groupIDsStore.add(groupId);
		}
	});

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
			<GenericDialog
				text={{
					trigger: m["group.leave"](),
					title: "Leave group?",
					description: m["group.leaveConfirm"]({
						name: data.group.name,
					}),
				}}
				bind:open={leaveDialogOpen}
			>
				{#snippet buttons()}
					<FormButton
						action="?/leaveGroup"
						serverRequiresUser
						text={m["group.leave"]()}
						onSuccess={async () => {
							groupIDsStore.remove(groupId);

							await goto("..");
						}}
						classes={classNames("btn btn-error")}
					/>
				{/snippet}
			</GenericDialog>
		{:else}
			<FormButton
				text={m["group.join"]()}
				action="?/joinGroup"
				serverRequiresUser
				classes={classNames("btn btn-ghost btn-sm text-success")}
				onSuccess={() => groupIDsStore.add(groupId)}
			/>
		{/if}
	</div>
</div>

<CreateQuoteForm form={data.quoteCreationForm} />

<SearchQuotesForm />

<QuotesList quotes={data.quotes} />
