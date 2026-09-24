<script lang="ts">
	import type { SuperValidated } from "sveltekit-superforms";
	import { m } from "$lib/paraglide/messages";
	import SchemaForm from "$lib/components/forms/SchemaForm.svelte";
	import type zodSchemas from "$lib/zod-schemas";
	import type z from "zod";
	import classNames from "classnames";
	import { onMount } from "svelte";

	type QuoteCreationData = z.infer<typeof zodSchemas.quotes.create>;

	let {
		form,
	}: { form: SuperValidated<QuoteCreationData, any, QuoteCreationData> } =
		$props();

	onMount(async () => {
		form.data.quotedAt = toDateTimeLocal(new Date());
	});

	function toDateTimeLocal(date: Date): string {
		const offset = date.getTimezoneOffset();
		const localDate = new Date(date.getTime() - offset * 60_000);
		return localDate.toISOString().slice(0, 19);
	}
</script>

<SchemaForm
	{form}
	class="mb-10 flex flex-col gap-3 rounded-box border border-base-300 bg-base-100 p-5"
	action="?/createQuote"
	submitLabel={m["group.addQuote"]()}
	submitBusyLabel={m["group.adding"]()}
	submitClass={classNames("btn btn-primary mt-1 self-start")}
	fields={{
		text: { name: "text", label: m["group.whatDidTheySay"]() },
		person: {
			name: "person",
			label: m["group.personRequired"](),
			placeholder: m["group.personPlaceholder"](),
			optional: true,
			optionalLabel: m["home.optional"](),
			other: {
				list: "people",
			},
		},
		quotedAt: {
			name: "quotedAt",
			label: m["group.dateTime"](),
			type: "datetime-local",
			other: {
				step: 1,
			},
		},
	}}
>
	{#snippet field_text({ constraints, errors, value, setValue })}
		<label class="fieldset-label" for="text">
			{m["group.whatDidTheySay"]()}
		</label>
		<textarea
			class="textarea w-full"
			rows="2"
			placeholder={m["group.quotePlaceholder"]()}
			name="text"
			aria-invalid={errors.text ? "true" : undefined}
			{value}
			onchange={(e) => setValue(e.currentTarget.value)}
			{...constraints.text}
		></textarea>
		{#if errors.text}
			<span class="validator-hint hidden">
				{errors.text}
			</span>
		{/if}
	{/snippet}
</SchemaForm>

<!-- <datalist id="people">
	{#each data.people as person (person)}
		<option value={person}></option>
	{/each}
</datalist> -->
