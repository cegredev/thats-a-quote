import {
	createGroup,
	getGroupDetails,
	getUserGroupMemberships,
} from "$lib/server/groups";
import zodSchemas from "$lib/zod-schemas";
import type { PageServerLoad } from "./$types";
import { superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { fail } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ locals }) => {
	let groups: { id: string; name: string }[] | undefined = undefined;

	if (locals.user) {
		const memberships = await getUserGroupMemberships(locals.user.id);
		groups = await getGroupDetails(memberships.map((m) => m.groupId));
	}

	const groupCreationForm = await superValidate(
		zod4(zodSchemas.groups.create),
	);

	return {
		groupCreationForm,
		groups,
	};
};

export const actions = {
	default: async ({ request }) => {
		const form = await superValidate(
			request,
			zod4(zodSchemas.groups.create),
		);
		console.log(form);

		if (!form.valid) {
			// Return { form } and things will just work.
			return fail(400, { form });
		}

		const id = await createGroup(form.data.name, form.data.id);

		return { form, id };
	},
};
