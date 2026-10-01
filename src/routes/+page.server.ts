import {
	addMembersToGroup,
	createGroup,
	getGroupDetails,
	getUserGroupMemberships,
} from "$lib/server/groups";
import zodSchemas from "$lib/zod-schemas";
import type { PageServerLoad } from "./$types";
import { superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { fail } from "@sveltejs/kit";
import { rateLimit } from "$lib/server/rate-limiting";

export const load: PageServerLoad = async ({ locals }) => {
	let groups: { id: string; name: string }[] | undefined = undefined;

	if (locals.user) {
		const memberships = await getUserGroupMemberships(locals.user.id);
		groups = await getGroupDetails(memberships.map((m) => m.groupId));
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

		const id = await createGroup(form.data.name, form.data.id);

		if (locals.user)
			await addMembersToGroup([
				{
					groupId: id,
					userId: locals.user.id,
				},
			]);

		return { form, id };
	}),
};
