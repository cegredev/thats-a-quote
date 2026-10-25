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

	let { data }: PageProps = $props();

	const groupId = page.params.id ?? "";

	onMount(() => {
		if (data.userIsMember) {
			groupIDsStore.add(groupId);
		}
	});

	let addQuoteDialogOpen: boolean = $state(false);
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
		onclick={() => (addQuoteDialogOpen = true)}
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
		title: m.group_create_head(),
	}}
	widthClass="w-full max-w-2xl!"
	bind:open={addQuoteDialogOpen}
>
	<CreateQuoteForm
		form={data.quoteCreationForm}
		mode="create"
		onSuccess={() => {
			addQuoteDialogOpen = false;
		}}
	/>
</ResponsiveDrawer>
