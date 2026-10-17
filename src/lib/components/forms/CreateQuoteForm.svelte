<script lang="ts">
	import type { SuperValidated } from "sveltekit-superforms";
	import { m } from "#lib/paraglide/messages.js";
	import SchemaForm from "#lib/components/forms/SchemaForm.svelte";
	import type zodSchemas from "#lib/zod-schemas.js";
	import type z from "zod";
	type QuoteCreationData = z.infer<typeof zodSchemas.quotes.create.insert>;

	let { form }: { form: SuperValidated<QuoteCreationData> } = $props();

	function setTime() {
		form.data.quotedAt = "";
		form.data.quotedAt = toDateTimeLocal(new Date());
	}

	setTime();

	function toDateTimeLocal(date: Date): string {
		const offset = date.getTimezoneOffset();
		const localDate = new Date(date.getTime() - offset * 60_000);
		return localDate.toISOString().slice(0, 19);
	}
</script>

<SchemaForm
	{form}
	class="mb-10 flex flex-col gap-3 rounded-lg border bg-card p-5"
	action="?/createQuote"
	submitLabel={m.group_addQuote()}
	submitBusyLabel={m.group_adding()}
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
				console.log("hi");
				setTimeout(() => setTime(), 2000);
			}
		},
	}}
></SchemaForm>
