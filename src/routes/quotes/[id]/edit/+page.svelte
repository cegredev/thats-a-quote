<script lang="ts">
	import CreateQuoteForm from "#lib/components/forms/CreateQuoteForm.svelte";
	import type { PageProps } from "./$types";
	import * as Card from "#lib/components_shadcn/ui/card/index.js";

	let { data }: PageProps = $props();
</script>

<div class="mb-4">
	<h1 class="font-display text-2xl font-semibold">Edit quote</h1>
</div>

<Card.Root size="sm">
	<Card.Content>
		<CreateQuoteForm form={data.quoteEditForm} mode="update" />
	</Card.Content>
</Card.Root>
