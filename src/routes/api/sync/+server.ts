import { json, error } from "@sveltejs/kit";
import { auth } from "$lib/server/auth.js";
import { addMembersToGroup as addMembersToGroups } from "$lib/server/groups.js";

export async function POST({ request }) {
	const body = await request.json().catch(() => ({}));
	const clientGroups: string[] = Array.isArray(body.vault) ? body.vault : [];

	const session = await auth.api.getSession({
		headers: request.headers,
	});

	if (!session) throw error(401, "unauthorized");

	if (clientGroups.length > 0) {
		await addMembersToGroups(
			clientGroups.map((groupId) => ({
				groupId,
				userId: session.user.id,
			})),
		);
	}

	return json({});
}
