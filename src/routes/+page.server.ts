import { getGroupDetails, getUserGroupMemberships } from "$lib/server/groups";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	let groups: { id: string; name: string }[] | undefined = undefined;

	if (locals.user) {
		const memberships = await getUserGroupMemberships(locals.user.id);
		groups = await getGroupDetails(memberships.map((m) => m.groupId));
	}

	return {
		groups,
	};
};
