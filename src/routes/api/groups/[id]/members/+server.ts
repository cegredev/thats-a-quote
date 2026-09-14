import { json, error } from "@sveltejs/kit";
import {
	getGroup,
	checkGroupPassword,
	addQuote,
	listQuotes,
	listPeople,
	removeMembersFromGroup,
} from "$lib/server/groups";

export async function DELETE({ params, request }) {
	const groupId = params.id;

	const body = await request.json().catch(() => ({}));
	const userId = (body.userId || "").trim();

	await removeMembersFromGroup([{ groupId, userId }]);

	return json({});
}
