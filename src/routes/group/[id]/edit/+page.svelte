<script lang="ts">
	import GroupCreationForm from "#lib/components/forms/GroupCreationForm.svelte";
	import type { PageProps } from "./$types";
	import * as Card from "#lib/shadcn/components/ui/card/index.js";
	import { m } from "#lib/paraglide/messages.js";

	let { data }: PageProps = $props();
</script>

<div class="mb-4">
	<h1 class="font-display text-2xl font-semibold">{m.group_create_head()}</h1>
</div>

<Card.Root size="sm">
	<Card.Content>
		<GroupCreationForm form={data.groupEditForm} mode="update" />
	</Card.Content>
</Card.Root>
