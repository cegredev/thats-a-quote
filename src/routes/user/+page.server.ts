import zodSchemas from "#lib/zod-schemas.js";
import type { PageServerLoad } from "./$types";
import { setError, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { error, fail, redirect } from "@sveltejs/kit";
import { isBlankEmail } from "#lib/utils.ts";
import { db } from "#lib/server/db.js";
import { user } from "#lib/server/db/schema.js";
import { eq } from "drizzle-orm";

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(303, "/login");

	const email = locals.user?.email ?? "";
	const updateUserForm = await superValidate(
		{
			email: isBlankEmail(email) ? "" : email,
		},
		zod4(zodSchemas.users.updateUser),
	);

	return {
		updateUserForm,
		user: locals.user,
	};
};

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

		await db().update(user).set(update).where(eq(user.id, locals.user.id));

		return { form };
	},
};
