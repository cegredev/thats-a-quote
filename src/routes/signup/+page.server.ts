import { fail, superValidate } from "sveltekit-superforms";
import type { PageServerLoad } from "./$types";
import { zod4 } from "sveltekit-superforms/adapters";
import zodSchemas from "#lib/zod-schemas.js";
import { rateLimit } from "#lib/server/rate-limiting.ts";
import { auth } from "#lib/server/auth.ts";
import { generateBlankEmail } from "#lib/utils.ts";
import { redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) redirect(303, "/user");

	const registerForm = await superValidate(zod4(zodSchemas.users.register));

	return {
		registerForm,
	};
};

export const actions = {
	register: rateLimit("strict", async (event) => {
		const form = await superValidate(
			event.request,
			zod4(zodSchemas.users.register),
		);

		if (!form.valid) {
			return fail(400, { form });
		}

		await auth().api.signUpEmail({
			body: {
				name: form.data.name,
				email: generateBlankEmail(form.data.username),
				username: form.data.username,
				password: form.data.password,
			},
		});

		return { form };
	}),
};
