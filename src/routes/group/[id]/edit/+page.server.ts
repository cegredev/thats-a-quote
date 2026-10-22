import zodSchemas from "#lib/zod-schemas.js";
import type { PageServerLoad } from "./$types";
import { superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { error, fail, redirect } from "@sveltejs/kit";
import { rateLimit } from "#lib/server/rate-limiting.js";
import { crud } from "#lib/server/db/crud.js";

export const load: PageServerLoad = async ({ params }) => {
	const groupId = params.id;
	if (!groupId) error(400, "No group id param");

	const group = await crud().groups.findOne({
		id: groupId,
	});
	if (!group) error(404, "no group to id");

	const groupEditForm = await superValidate(
		{
			name: group.name,
		},
		zod4(zodSchemas.groups.create.update),
	);

	return {
		groupEditForm,
	};
};

export const actions = {
	editGroup: rateLimit("medium", async ({ request, params }) => {
		const groupId = params.id;
		if (!groupId) error(400, "No group id param");

		const form = await superValidate(
			request,
			zod4(zodSchemas.groups.create.update),
		);

		if (!form.valid) return fail(400, { form });

		await crud().groups.update(groupId, {
			...form.data,
		});

		redirect(303, ".");
	}),
};
