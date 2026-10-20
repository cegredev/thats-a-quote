<script lang="ts">
	import CreateQuoteForm from "#lib/components/forms/CreateQuoteForm.svelte";
	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();
</script>

<div class="mb-4">
	<h1 class="font-display text-2xl font-semibold">Edit quote</h1>
</div>

<CreateQuoteForm form={data.quoteEditForm} mode="update" />
