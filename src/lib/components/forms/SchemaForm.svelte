<script module lang="ts">
	export type FieldConfig = {
		/** Must match a key of the form's schema */
		name: string;
		label: string;
		/** HTML input type, defaults to "text" */
		type?: string;
		optional?: boolean;
		/** Text shown next to the label when `optional` is true, e.g. "(optional)" */
		optionalLabel?: string;
		placeholder?: string;
		autocomplete?: string;
		skipConstraints?: boolean;
		other?: any;
	};
</script>

<script lang="ts" generics="T extends Record<string, unknown>">
	import { m } from "#lib/paraglide/messages.js";
	import {
		type InputConstraints,
		superForm,
		type SuperValidated,
		type ValidationErrors,
	} from "sveltekit-superforms";
	import { untrack, type Snippet } from "svelte";
	import { type Readable } from "svelte/store";
	import { Button } from "#lib/shadcn/components/ui/button/index.js";
	import { Input } from "#lib/shadcn/components/ui/input/index.js";
	import * as Label from "#lib/shadcn/components/ui/label/index.js";
	import { Textarea } from "#lib/shadcn/components/ui/textarea/index.js";
	import { cn } from "cn";

	type SuperFormOptions = NonNullable<Parameters<typeof superForm<T>>[1]>;
	type SuperFormReturn = ReturnType<typeof superForm<T>>;
	type UnwrapStore<S> = S extends Readable<infer T> ? T : never;

	type CustomFieldSnippet<K extends keyof T> = Snippet<
		[
			{
				config: FieldConfig;
				value: UnwrapStore<SuperFormReturn["form"]>[K];
				setValue: (
					value: UnwrapStore<SuperFormReturn["form"]>[K],
				) => void;
				errors: UnwrapStore<SuperFormReturn["errors"]>;
				constraints: UnwrapStore<SuperFormReturn["constraints"]>;
			},
		]
	>;

	type CustomFields = Partial<{
		[K in Extract<keyof T, string> as `field_${K}`]: CustomFieldSnippet<K>;
	}>;

	type BaseCustomFieldSnippet = Snippet<
		[
			{
				config: FieldConfig;
				form: UnwrapStore<SuperFormReturn["form"]>;
				errors: UnwrapStore<SuperFormReturn["errors"]>;
				constraints: UnwrapStore<SuperFormReturn["constraints"]>;
			},
		]
	>;

	let {
		form,
		fields,
		action,
		submitLabel,
		submitBusyLabel,
		submitClass,
		options,
		class: className,
		fieldBase,
		footer,
		...customFields
	}: {
		/** The SuperValidated form data passed down from a `+page.server.ts` load */
		form: SuperValidated<T>;
		/** Declarative description of the fields to render, in order */
		fields: Partial<Record<Extract<keyof T, string>, FieldConfig>>;
		/** Form `action` attribute, e.g. "?/createGroup" */
		action: string;
		submitLabel: string;
		submitBusyLabel: string;
		submitClass?: string;
		/** Anything else you'd normally pass as the 2nd arg to superForm (onResult, onUpdated, validators, ...) */
		options?: SuperFormOptions;
		class?: string;
		/** Override rendering of a single field; omit to use the default <input> */
		fieldBase?: BaseCustomFieldSnippet;
		/** Override the submit area; receives current submitting state */
		footer?: Snippet<[{ submitting: boolean }]>;
	} & CustomFields = $props();

	let customFieldsTyped: CustomFields = $derived(
		customFields as unknown as CustomFields,
	);

	const {
		form: formData,
		errors,
		constraints,
		enhance,
		submitting,
	} = superForm<T>(
		untrack(() => form),
		{
			delayMs: 300,
			...untrack(() => options),
		},
	);

	function typedEntries<T extends object>(obj: T) {
		return Object.entries(obj).filter(
			([, value]) => value !== undefined,
		) as [Extract<keyof T, string>, Exclude<T[keyof T], undefined>][];
	}
</script>

<form
	class={cn("flex flex-col gap-3", className)}
	method="POST"
	{action}
	use:enhance
>
	{#each typedEntries(fields) as [name, cfg] (cfg.name)}
		{@const customField = customFieldsTyped[
			`field_${name}`
		] as CustomFieldSnippet<typeof name>}

		{#if customField}
			{@render customField({
				config: cfg,
				value: $formData[name],
				setValue: (v) => ($formData[name] = v),
				errors: $errors,
				constraints: $constraints,
			})}
		{:else if fieldBase}
			{@render fieldBase({
				config: cfg,
				form: $formData,
				errors: $errors,
				constraints: $constraints,
			})}
		{:else}
			{@const inputProps = {
				id: cfg.name,
				name: cfg.name,
				placeholder: cfg.placeholder,
				"aria-invalid": $errors[cfg.name as keyof ValidationErrors<T>]
					? "true"
					: undefined,
				...(cfg.skipConstraints
					? {}
					: ($constraints[
							cfg.name as keyof InputConstraints<T>
						] as Record<string, unknown>)),
				...cfg.other,
			}}

			<Label.Root for={cfg.name}>
				{cfg.label}
				{#if cfg.optional}
					<span class="text-muted-foreground">
						({cfg.optionalLabel ?? m.home_optional()})
					</span>
				{/if}
			</Label.Root>

			{#if cfg.type === "textarea"}
				<Textarea
					class="w-full"
					rows="2"
					bind:value={$formData[cfg.name as keyof T]}
					{...inputProps}
				/>
			{:else}
				<Input
					type={cfg.type ?? "text"}
					class="w-full"
					bind:value={$formData[cfg.name as keyof T]}
					{...inputProps}
				/>
			{/if}
			{#if $errors[cfg.name as keyof ValidationErrors<T>]}
				<span class="text-sm text-destructive">
					{$errors[cfg.name as keyof ValidationErrors<T>]}
				</span>
			{/if}
		{/if}
	{/each}

	{#if footer}
		{@render footer({ submitting: $submitting })}
	{:else}
		<Button
			type="submit"
			class={cn("mt-1 self-start", submitClass)}
			disabled={$submitting}
		>
			{$submitting ? submitBusyLabel : submitLabel}
		</Button>
	{/if}
</form>
