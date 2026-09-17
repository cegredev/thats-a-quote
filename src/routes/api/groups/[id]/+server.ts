import { json, error } from "@sveltejs/kit";
import { getGroup, listQuotesMatching, listPeople } from "$lib/server/groups";

export async function GET({ params, url }) {
	const group = await getGroup(params.id);
	if (!group) throw error(404, "This group does not exist.");

	return json({
		name: group.name,
		quotes: await listQuotesMatching(group.id, {
			content: url.searchParams.get("content") || undefined,
			person: url.searchParams.get("person") || undefined,
		}),
		people: await listPeople(group.id),
	});
}
