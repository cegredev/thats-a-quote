<script lang="ts">
	import SchemaForm from "./SchemaForm.svelte";
	import * as Input from "#lib/shadcn/components/ui/input/index.js";
	import * as Label from "#lib/shadcn/components/ui/label/index.js";
	import { Mail } from "@lucide/svelte";
	import type z from "zod";
	import type zodSchemas from "#lib/zod-schemas.js";
	import type { SuperValidated } from "sveltekit-superforms";
	import { m } from "#lib/paraglide/messages.js";
	import { authClient } from "#lib/client/frontend-auth.ts";
	import type { MaybePromise } from "#lib/types.ts";

	type UserData = z.infer<typeof zodSchemas.users.updateUser>;

	let {
		form,
		onSuccess,
	}: {
		form: SuperValidated<UserData>;
		onSuccess?: () => MaybePromise<void>;
	} = $props();

	const session = authClient.useSession();
</script>

<SchemaForm
	{form}
	class="px-1 pb-2"
	action="?/updateUser"
	submitLabel={m.account_emailSave()}
	submitBusyLabel={m.account_pleaseWait()}
	options={{
		onUpdated: async ({ form }: { form: { valid: boolean } }) => {
			if (!form.valid) return;

			await $session.refetch();
		},
		onResult: async ({ result }) => {
			if (result.type === "success") {
				if (onSuccess) await onSuccess();
			}
		},
	}}
	fields={{
		email: {
			name: "email",
			type: "email",
			label: m.account_email(),
			placeholder: m.account_emailPlaceholder(),
		},
	}}
>
	{#snippet field_email({ config, value, setValue, errors, constraints })}
		{@const emailError = errors.email?.[0]}
		<div class="grid gap-2">
			<Label.Root for={config.name}>{config.label}</Label.Root>
			<div class="relative">
				<Mail
					class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
					aria-hidden="true"
				/>
				<Input.Root
					id={config.name}
					name={config.name}
					type={config.type}
					autocomplete="email"
					placeholder={config.placeholder}
					{value}
					oninput={(event) => setValue(event.currentTarget.value)}
					aria-invalid={emailError ? "true" : undefined}
					aria-describedby="email-help"
					class="pl-9"
					{...constraints.email}
				/>
			</div>
			<p id="email-help" class="text-sm text-muted-foreground">
				{m.account_emailHelp()}
			</p>
			{#if emailError}
				<p role="alert" class="text-sm text-destructive">
					{emailError === "emailInUse"
						? m.account_emailInUse()
						: emailError === "notSignedIn"
							? m.account_emailSignInRequired()
							: m.account_emailInvalid()}
				</p>
			{/if}
		</div>
	{/snippet}
</SchemaForm>
