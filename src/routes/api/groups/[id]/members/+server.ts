import { json } from "@sveltejs/kit";
import { removeMembersFromGroup } from "$lib/server/groups";

export async function DELETE({ params, request }) {
	const groupId = params.id;

	const body = await request.json().catch(() => ({}));
	const userId = (body.userId || "").trim();

	await removeMembersFromGroup([{ groupId, userId }]);

	return json({});
}
