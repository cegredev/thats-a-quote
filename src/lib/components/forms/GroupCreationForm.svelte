<script lang="ts">
	import { goto } from "$app/navigation";
	import type { SuperValidated } from "sveltekit-superforms";
	import { m } from "#lib/paraglide/messages.js";
	import { groupIDsStore } from "#lib/client/storage.svelte.js";
	import SchemaForm from "#lib/components/forms/SchemaForm.svelte";
	import type zodSchemas from "#lib/zod-schemas.js";
	import type z from "zod";

	type GroupCreationData = z.infer<typeof zodSchemas.groups.create.insert>;

	let { form }: { form: SuperValidated<GroupCreationData> } = $props();
</script>

<SchemaForm
	{form}
	action="?/createGroup"
	submitLabel={m.home_create()}
	submitBusyLabel={m.home_createBusy()}
	fields={{
		name: { name: "name", label: m.home_groupName() },
		id: {
			name: "id",
			label: m.home_customId(),
			optional: true,
			optionalLabel: m.home_optional(),
		},
	}}
	options={{
		onResult: async ({ result }) => {
			if (result.type === "success") {
				const id = result.data?.id;
				if (!id) return;

				groupIDsStore.add(id);
				await goto(`/group/${id}`);
			}
		},
	}}
/>
