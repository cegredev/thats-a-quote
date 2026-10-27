<script lang="ts">
	import type { SuperValidated } from "sveltekit-superforms";
	import { m } from "#lib/paraglide/messages.js";
	import SchemaForm from "#lib/components/forms/SchemaForm.svelte";
	import type zodSchemas from "#lib/zod-schemas.js";
	import type z from "zod";
	import { authClient } from "#lib/client/frontend-auth.js";

	type RegisterData = z.infer<typeof zodSchemas.users.register>;

	let { form }: { form: SuperValidated<RegisterData> } = $props();

	const session = authClient.useSession();
</script>

<SchemaForm
	{form}
	class="flex flex-col gap-3"
	action="?/register"
	submitLabel={m.account_signUp()}
	submitBusyLabel={m.account_signingUp()}
	fields={{
		name: {
			name: "name",
			label: m.account_name(),
			type: "text",
		},
		username: {
			name: "username",
			label: m.account_username(),
			type: "string",
			skipConstraints: true,
		},
		password: {
			name: "password",
			label: m.account_password(),
			type: "password",
		},
	}}
	options={{
		onResult: async ({ result }) => {
			if (result.type === "success") {
				await $session.refetch();
			}
		},
	}}
/>
