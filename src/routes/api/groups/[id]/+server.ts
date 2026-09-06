import { json, error } from "@sveltejs/kit";
import {
	getGroup,
	groupHasPassword,
	checkGroupPassword,
	listQuotesMatching,
	listPeople,
} from "$lib/server/groups";

export async function GET({ params, url }) {
	const group = await getGroup(params.id);
	if (!group) throw error(404, "This group does not exist.");

	const password = url.searchParams.get("password") || "";
	const hasPassword = groupHasPassword(group);

	if (hasPassword && !checkGroupPassword(group, password)) {
		return json(
			{ name: group.name, hasPassword: true, authorized: false },
			{ status: 401 },
		);
	}

	return json({
		name: group.name,
		hasPassword,
		authorized: true,
		quotes: await listQuotesMatching(group.id, {
			content: url.searchParams.get("content") || undefined,
			person: url.searchParams.get("person") || undefined,
		}),
		people: await listPeople(group.id),
	});
}
