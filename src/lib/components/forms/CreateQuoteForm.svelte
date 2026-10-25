<script lang="ts">
	import type { SuperValidated } from "sveltekit-superforms";
	import { m } from "#lib/paraglide/messages.js";
	import SchemaForm from "#lib/components/forms/SchemaForm.svelte";
	import type zodSchemas from "#lib/zod-schemas.js";
	import type z from "zod";
	import { toDateTimeLocal } from "#lib/utils.ts";
	import type { MaybePromise } from "#lib/types.ts";
	type QuoteCreationData =
		| z.infer<typeof zodSchemas.quotes.create.insert>
		| z.infer<typeof zodSchemas.quotes.create.update>;

	let {
		form,
		mode,
		onSuccess,
	}: { onSuccess?: () => MaybePromise<void> } & {
		form: SuperValidated<QuoteCreationData>;
		mode: "create" | "update";
	} = $props();

	function setTime() {
		form.data.quotedAt = "";
		form.data.quotedAt = toDateTimeLocal(new Date());
	}

	if (!form.data.quotedAt) setTime();
</script>

<SchemaForm
	{form}
	action={mode === "create" ? "?/createQuote" : "?/editQuote"}
	submitLabel={mode === "create" ? m.group_addQuote() : m.edit_quote()}
	submitBusyLabel={mode === "create" ? m.group_adding() : m.quote_editing()}
	submitClass="mt-1 self-start"
	fields={{
		text: {
			name: "text",
			type: "textarea",
			label: m.group_whatDidTheySay(),
		},
		person: {
			name: "person",
			label: m.group_personRequired(),
			placeholder: m.group_personPlaceholder(),
			optional: true,
			optionalLabel: m.home_optional(),
			other: {
				list: "people",
			},
		},
		quotedAt: {
			name: "quotedAt",
			label: m.group_dateTime(),
			type: "datetime-local",
			other: {
				step: 1,
			},
		},
		context: {
			name: "context",
			label: m.group_context(),
			type: "textarea",
			optional: true,
		},
	}}
	options={{
		onResult: async ({ result }) => {
			if (result.type === "success") {
				if (mode === "create") setTimeout(() => setTime(), 2000);

				if (onSuccess) await onSuccess();
			}
		},
	}}
></SchemaForm>
