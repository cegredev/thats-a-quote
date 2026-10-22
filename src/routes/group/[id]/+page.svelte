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
	import Button from "#lib/components_shadcn/ui/button/button.svelte";
	import { PlusIcon } from "@lucide/svelte";

	let { data }: PageProps = $props();

	const groupId = page.params.id ?? "";

	onMount(() => {
		if (data.userIsMember) {
			groupIDsStore.add(groupId);
		}
	});
</script>

<Title text={data.group.name ?? `${m.group_fallbackTitle()} · ${m.brand()}`} />

<QuotesPageHead
	group={data.group}
	totalQuotes={data.quotesPagination.totalItems}
/>

<datalist id="people">
	{#each data.people as person (person)}
		<option value={person}></option>
	{/each}
</datalist>

<SearchQuotesForm />

<QuotesList pagination={data.quotesPagination} />

<div
	class="pointer-events-none fixed inset-x-0 z-40 mx-auto flex max-w-3xl justify-end px-5"
	style="bottom: calc(var(--nav-height, 0px) + 1rem)"
>
	<Button
		href={page.url.pathname + "/new"}
		variant="default"
		size="icon-lg"
		class="pointer-events-auto size-14 rounded-full shadow-lg [&_svg]:size-6"
		aria-label={m.group_addQuote()}
		title={m.group_addQuote()}
	>
		<PlusIcon />
	</Button>
</div>
