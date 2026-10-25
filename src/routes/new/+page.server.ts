import zodSchemas from "#lib/zod-schemas.js";
import type { PageServerLoad } from "./$types";
import { superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { fail } from "@sveltejs/kit";
import { rateLimit } from "#lib/server/rate-limiting.js";
import { crud } from "#lib/server/db/crud.js";
import { addMembersToGroup } from "#lib/server/queries/groups.ts";

export const load: PageServerLoad = async ({}) => {
	const groupCreationForm = await superValidate(
		zod4(zodSchemas.groups.create.insert),
	);

	return {
		groupCreationForm,
	};
};

export const actions = {
	createGroup: rateLimit("medium", async ({ request, locals }) => {
		const form = await superValidate(
			request,
			zod4(zodSchemas.groups.create.insert),
		);

		if (!form.valid) return fail(400, { form });

		const group = await crud().groups.create(
			{
				name: form.data.name,
				id: form.data.id,
			},
			{
				skipValidation: true,
			},
		);

		if (locals.user)
			await addMembersToGroup([
				{
					groupId: group.id,
					userId: locals.user.id,
				},
			]);

		return { form, id: group.id };
	}),
};
