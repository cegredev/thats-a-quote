import zodSchemas from "#lib/zod-schemas.js";
import type { PageServerLoad } from "./$types";
import { setError, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { error, fail } from "@sveltejs/kit";
import { auth } from "#lib/server/auth.js";
import { generateBlankEmail } from "#lib/utils.ts";
import { isBlankEmail } from "#lib/utils.ts";
import { isAPIError } from "better-auth/api";
import { limiterOnData, rateLimit } from "#lib/server/rate-limiting.js";
import { db } from "#lib/server/db.js";
import { user } from "#lib/server/db/schema.js";
import { eq, sql } from "drizzle-orm";

export const load: PageServerLoad = async ({ locals }) => {
	const loginForm = await superValidate(zod4(zodSchemas.users.login));
	const registerForm = await superValidate(zod4(zodSchemas.users.register));

	const email = locals.user?.email ?? "";
	const updateUserForm = await superValidate(
		{
			email: isBlankEmail(email) ? "" : email,
		},
		zod4(zodSchemas.users.updateUser),
	);

	return {
		loginForm,
		registerForm,
		updateUserForm,
	};
};

const loginLimiter = limiterOnData([
	[5, "m"],
	[10, "h"],
	[20, "d"],
]);

export const actions = {
	updateUser: async ({ request, locals }) => {
		const form = await superValidate(
			request,
			zod4(zodSchemas.users.updateUser),
		);

		if (!form.valid) return fail(400, { form });

		if (!locals.user) error(401, "not signed in");

		const { email } = form.data;

		if (email) {
			const [existingUser] = await db()
				.select({ id: user.id })
				.from(user)
				.where(eq(user.email, email))
				.limit(1);

			if (existingUser && existingUser.id !== locals.user.id) {
				return setError(form, "email", "emailInUse");
			}
		}

		const update = {
			...form.data,
			...(email ? { emailVerified: false } : {}),
		};

		await db()
			.update(user)
			.set(update)
			.where(eq(user.id, locals.user.id));

		return { form };
	},
	register: rateLimit("strict", async (event) => {
		const form = await superValidate(
			event.request,
			zod4(zodSchemas.users.register),
		);

		if (!form.valid) {
			// Return { form } and things will just work.
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
