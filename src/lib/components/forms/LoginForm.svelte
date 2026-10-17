<script lang="ts">
	import type { SuperValidated } from "sveltekit-superforms";
	import { m } from "#lib/paraglide/messages.js";
	import SchemaForm from "#lib/components/forms/SchemaForm.svelte";
	import type zodSchemas from "#lib/zod-schemas.js";
	import type z from "zod";
	import { authClient } from "#lib/client/frontend-auth.js";

	type LoginData = z.infer<typeof zodSchemas.users.login>;

	let { form }: { form: SuperValidated<LoginData> } = $props();

	const session = authClient.useSession();
</script>

<SchemaForm
	{form}
	class="flex flex-col gap-3"
	action="?/login"
	submitLabel={m.account_login()}
	submitBusyLabel={m.account_loggingIn()}
	fields={{
		email: {
			name: "email",
			label: m.account_email(),
			type: "email",
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
