<script lang="ts">
	import CreateQuoteForm from "#lib/components/forms/CreateQuoteForm.svelte";
	import type { PageProps } from "./$types";
	import * as Card from "#lib/shadcn/components/ui/card/index.js";
	import { m } from "#lib/paraglide/messages.js";

	let { data }: PageProps = $props();
</script>

<div class="mb-4">
	<h1 class="font-display text-2xl font-semibold">{m.quote_create_head()}</h1>
</div>

<Card.Root size="sm">
	<Card.Content>
		<CreateQuoteForm form={data.quoteCreationForm} mode="create" />
	</Card.Content>
</Card.Root>
