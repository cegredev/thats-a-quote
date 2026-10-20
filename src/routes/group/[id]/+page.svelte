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

<div class="w-full flex flex-col items-center mb-4">
	<Button
		href={page.url.pathname + "/new"}
		variant="default"
		size="lg"
		class="px-16"
	>
		Add quote
	</Button>
</div>

<datalist id="people">
	{#each data.people as person (person)}
		<option value={person}></option>
	{/each}
</datalist>

<SearchQuotesForm />

<QuotesList pagination={data.quotesPagination} />
