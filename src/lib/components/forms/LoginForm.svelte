<script lang="ts">
	import type { SuperValidated } from "sveltekit-superforms";
	import { m } from "$lib/paraglide/messages";
	import SchemaForm from "$lib/components/forms/SchemaForm.svelte";
	import type zodSchemas from "$lib/zod-schemas";
	import type z from "zod";
	import { authClient } from "$lib/client/frontend-auth";

	type LoginData = z.infer<typeof zodSchemas.users.login>;

	let { form }: { form: SuperValidated<LoginData> } = $props();

	const session = authClient.useSession();
</script>

<SchemaForm
	{form}
	class="flex flex-col gap-3"
	action="?/login"
	submitLabel={"Log in"}
	submitBusyLabel={"Logging in..."}
	fields={{
		email: {
			name: "email",
			label: m["account.username"](),
			type: "email",
			skipConstraints: true,
		},
		password: {
			name: "password",
			label: "Password",
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
