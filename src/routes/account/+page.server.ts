import zodSchemas from "$lib/zod-schemas";
import type { PageServerLoad } from "./$types";
import { superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { fail } from "@sveltejs/kit";
import { auth } from "$lib/server/auth";

export const load: PageServerLoad = async ({ locals }) => {
	const loginForm = await superValidate(zod4(zodSchemas.users.login));
	const registerForm = await superValidate(zod4(zodSchemas.users.register));

	return {
		loginForm,
		registerForm,
	};
};

export const actions = {
	register: async ({ request }) => {
		const form = await superValidate(
			request,
			zod4(zodSchemas.users.register),
		);

		if (!form.valid) {
			// Return { form } and things will just work.
			return fail(400, { form });
		}

		await auth.api.signUpEmail({
			body: {
				name: form.data.name,
				email: form.data.email,
				password: form.data.password,
			},
		});

		return { form };
	},
	login: async ({ request }) => {
		const form = await superValidate(request, zod4(zodSchemas.users.login));

		if (!form.valid) {
			// Return { form } and things will just work.
			return fail(400, { form });
		}

		await auth.api.signInEmail({
			body: {
				email: form.data.email,
				password: form.data.password,
			},
		});

		return { form };
	},
};
