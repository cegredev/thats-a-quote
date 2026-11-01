import { fail, setError, superValidate } from "sveltekit-superforms";
import type { PageServerLoad } from "./$types";
import { zod4 } from "sveltekit-superforms/adapters";
import zodSchemas from "#lib/zod-schemas.js";
import { limiterOnData, rateLimit } from "#lib/server/rate-limiting.ts";
import { auth } from "#lib/server/auth.ts";
import { error, redirect } from "@sveltejs/kit";
import { isAPIError } from "better-auth/api";
import { FILL_WITH_DUMMY_DATA } from "$app/env/private";
import { DEMO_PASSWORD, DEMO_USERNAME } from "#lib/constants.js";

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) redirect(303, "/user");

	const loginForm = await superValidate(
		FILL_WITH_DUMMY_DATA
			? {
					username: DEMO_USERNAME,
					password: DEMO_PASSWORD,
				}
			: {},
		zod4(zodSchemas.users.login),
	);

	return {
		loginForm,
	};
};

const loginLimiter = limiterOnData([
	[5, "m"],
	[10, "h"],
	[20, "d"],
]);

export const actions = {
	login: rateLimit("strict", async (event) => {
		const form = await superValidate(
			event.request,
			zod4(zodSchemas.users.login),
		);

		if (!form.valid) {
			// Return { form } and things will just work.
			return fail(400, { form });
		}

		if (await loginLimiter.isLimited(event, { keys: [form.data.username] }))
			error(429, "rate limited on username");

		try {
			await auth().api.signInUsername({
				body: {
					username: form.data.username,
					password: form.data.password,
				},
			});
		} catch (error) {
			if (isAPIError(error)) {
				console.log(error.message, error.status);

				return setError(form, "", "Invalid username or password");
			}

			console.error(error);
		}

		return { form };
	}),
};
