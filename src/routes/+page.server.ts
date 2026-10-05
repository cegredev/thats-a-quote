import { addMembersToGroup, getUserGroupMemberships } from "#lib/server/groups.js";
import zodSchemas from "#lib/zod-schemas.js";
import type { PageServerLoad } from "./$types";
import { superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { fail } from "@sveltejs/kit";
import { rateLimit } from "#lib/server/rate-limiting.js";
import { groupsCrud } from "#lib/server/db/crud.js";

export const load: PageServerLoad = async ({ locals }) => {
	let groups: { id: string; name: string }[] | undefined = undefined;

	if (locals.user) {
		const memberships = await getUserGroupMemberships(locals.user.id);
		const groupsPagination = await groupsCrud.list({
			filters: {
				id: {
					in: memberships.map((m) => m.groupId),
				},
			},
		});

		groups = groupsPagination.results;
	}

	const groupCreationForm = await superValidate(
		zod4(zodSchemas.groups.create.insert),
	);

	return {
		groupCreationForm,
		groups,
	};
};

export const actions = {
	createGroup: rateLimit("medium", async ({ request, locals }) => {
		const form = await superValidate(
			request,
			zod4(zodSchemas.groups.create.insert),
		);

		if (!form.valid) return fail(400, { form });

		const group = await groupsCrud.create(
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
