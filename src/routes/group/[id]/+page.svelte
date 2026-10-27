<script lang="ts">
	import QuotesPageHead from "./QuotesPageHead.svelte";
	import { page } from "$app/state";
	import type { PageProps } from "./$types";
	import { m } from "#lib/paraglide/messages.js";
	import { groupIDsStore } from "#lib/client/storage.svelte.js";
	import Title from "#lib/components/util/Title.svelte";
	import SearchQuotesForm from "#lib/components/forms/SearchQuotesForm.svelte";
	import QuotesList from "#lib/components/quotes/QuotesList.svelte";
	import { onMount } from "svelte";
	import Button from "#lib/shadcn/components/ui/button/button.svelte";
	import { PlusIcon } from "@lucide/svelte";
	import ResponsiveDrawer from "#lib/components/drawer/ResponsiveDrawer.svelte";
	import CreateQuoteForm from "#lib/components/forms/CreateQuoteForm.svelte";
	import {
		addQueryParamToHref,
		closeEditDialog,
	} from "#lib/client/component-utils.svelte.ts";
	import GroupCreationForm from "#lib/components/forms/GroupCreationForm.svelte";
	import { goto } from "$app/navigation";

	let { data }: PageProps = $props();

	const groupId = page.params.id ?? "";

	onMount(() => {
		if (data.userIsMember) {
			groupIDsStore.add(groupId);
		}
	});

	let addQuoteDialogOpen = $derived(
		page.url.searchParams.get("create") === "quote",
	);
	let editQuoteDialogOpen = $derived(page.url.searchParams.has("edit"));
	let editGroupDialogOpen = $derived(page.url.searchParams.has("editGroup"));

	$inspect("quote dialog open", addQuoteDialogOpen);
</script>

<Title text={data.group.name ?? `${m.group_fallbackTitle()} · ${m.brand()}`} />

<QuotesPageHead group={data.group} totalQuotes={data.quotes.pagination.total} />

<datalist id="people">
	{#each data.people as person (person)}
		<option value={person}></option>
	{/each}
</datalist>

<SearchQuotesForm />

<QuotesList quotes={data.quotes} />

<div
	class="pointer-events-none fixed inset-x-0 z-40 mx-auto flex max-w-3xl justify-end px-5"
	style="bottom: calc(var(--nav-height, 0px) + 1rem)"
>
	<Button
		href={addQueryParamToHref(page.url.href, "create", "quote")}
		variant="default"
		size="icon-lg"
		class="pointer-events-auto size-14 rounded-full shadow-lg [&_svg]:size-6"
		aria-label={m.group_addQuote()}
		title={m.group_addQuote()}
	>
		<PlusIcon />
	</Button>
</div>

<ResponsiveDrawer
	text={{
		title: m.quote_create_head(),
	}}
	widthClass="w-full max-w-2xl!"
	bind:open={addQuoteDialogOpen}
	onOpenChange={(open) => {
		if (!open && page.url.searchParams.has("create")) {
			window.history.back();
		}
	}}
>
	<CreateQuoteForm
		form={data.quoteCreationForm}
		mode="create"
		onSuccess={() => {
			addQuoteDialogOpen = false;
		}}
	/>
</ResponsiveDrawer>

<ResponsiveDrawer
	text={{
		title: m.edit_quote(),
	}}
	widthClass="w-full max-w-2xl!"
	bind:open={editQuoteDialogOpen}
	onOpenChange={(open) => {
		if (!open && page.url.searchParams.has("edit")) {
			window.history.back();
		}
	}}
>
	{#if data.quoteEditForm}
		<CreateQuoteForm
			form={data.quoteEditForm}
			mode="update"
			quoteId={page.url.searchParams.get("edit") ?? undefined}
			onSuccess={async () => {
				await closeEditDialog(page.url.href);
			}}
		/>
	{/if}
</ResponsiveDrawer>

<ResponsiveDrawer
	text={{
		title: m.group_edit(),
	}}
	widthClass="w-full max-w-2xl!"
	bind:open={editGroupDialogOpen}
	onOpenChange={(open) => {
		if (!open && page.url.searchParams.has("editGroup")) {
			window.history.back();
		}
	}}
>
	{#if data.groupEditForm}
		<GroupCreationForm
			form={data.groupEditForm}
			mode="update"
			onSuccess={async () => {
				await closeEditDialog(page.url.href, "editGroup");
			}}
		/>
	{/if}
</ResponsiveDrawer>
