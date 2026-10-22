<script lang="ts">
	import { goto } from "$app/navigation";
	import type { SuperValidated } from "sveltekit-superforms";
	import { m } from "#lib/paraglide/messages.js";
	import { groupIDsStore } from "#lib/client/storage.svelte.js";
	import SchemaForm from "#lib/components/forms/SchemaForm.svelte";
	import type zodSchemas from "#lib/zod-schemas.js";
	import type z from "zod";

	type GroupCreationData = z.infer<typeof zodSchemas.groups.create.insert>;
	type GroupUpdateData = z.infer<typeof zodSchemas.groups.create.update>;

	let props:
		| { form: SuperValidated<GroupCreationData>; mode: "create" }
		| { form: SuperValidated<GroupUpdateData>; mode: "update" } = $props();
</script>

<SchemaForm
	form={props.form}
	action={props.mode === "create" ? "?/createGroup" : "?/editGroup"}
	submitLabel={props.mode === "create" ? m.home_create() : "Edit group"}
	submitBusyLabel={props.mode === "create"
		? m.home_createBusy()
		: "Editing..."}
	fields={{
		name: { name: "name", label: m.home_groupName() },
		...(props.mode === "create"
			? {
					id: {
						name: "id",
						label: m.home_customId(),
						optional: true,
						optionalLabel: m.home_optional(),
					},
				}
			: {}),
	}}
	options={{
		onResult: async ({ result }) => {
			if (result.type === "success") {
				const id = result.data?.id;
				if (!id) return;

				if (props.mode === "create") {
					groupIDsStore.add(id);
				}
				await goto(`/group/${id}`);
			}
		},
	}}
/>
