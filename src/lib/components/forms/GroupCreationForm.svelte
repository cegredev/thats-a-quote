<script lang="ts">
	import { goto } from "$app/navigation";
	import type { SuperValidated } from "sveltekit-superforms";
	import { m } from "$lib/paraglide/messages";
	import { groupIDsStore } from "$lib/client/storage.svelte";
	import SchemaForm from "$lib/components/SchemaForm.svelte";
	import type zodSchemas from "$lib/zod-schemas";
	import type z from "zod";

	type GroupCreationData = z.infer<typeof zodSchemas.groups.create>;

	let {
		form,
	}: { form: SuperValidated<GroupCreationData, any, GroupCreationData> } =
		$props();
</script>

<SchemaForm
	{form}
	action="?/createGroup"
	submitLabel={m["home.create"]()}
	submitBusyLabel={m["home.createBusy"]()}
	fields={{
		name: { name: "name", label: m["home.groupName"]() },
		id: {
			name: "id",
			label: m["home.customId"](),
			optional: true,
			optionalLabel: m["home.optional"](),
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
