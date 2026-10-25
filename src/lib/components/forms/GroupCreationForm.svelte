<script lang="ts">
	import type { SuperValidated } from "sveltekit-superforms";
	import { m } from "#lib/paraglide/messages.js";
	import { groupIDsStore } from "#lib/client/storage.svelte.js";
	import SchemaForm from "#lib/components/forms/SchemaForm.svelte";
	import type zodSchemas from "#lib/zod-schemas.js";
	import type z from "zod";
	import type { MaybePromise } from "#lib/types.ts";

	type GroupCreationData = z.infer<typeof zodSchemas.groups.create.insert>;
	type GroupUpdateData = z.infer<typeof zodSchemas.groups.create.update>;

	let props: { onSuccess?: () => MaybePromise<void> } & (
		| { form: SuperValidated<GroupCreationData>; mode: "create" }
		| { form: SuperValidated<GroupUpdateData>; mode: "update" }
	) = $props();
</script>

<SchemaForm
	form={props.form}
	action={props.mode === "create" ? "?/createGroup" : "?/editGroup"}
	submitLabel={props.mode === "create" ? m.home_create() : "Edit group"}
	submitBusyLabel={props.mode === "create"
		? m.home_createBusy()
		: "Editing..."}
	submitClass="w-full"
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
				if (props.mode === "create") {
					const id = result.data?.id;
					if (id) groupIDsStore.add(id);
				}

				if (props.onSuccess) await props.onSuccess();
			}
		},
	}}
/>
