import { json, error } from "@sveltejs/kit";
import { getGroup, listPeople } from "$lib/server/groups";
import { listQuotesMatching } from "$lib/server/quotes";

export async function GET({ params, url }) {
	const group = await getGroup(params.id);
	if (!group) throw error(404, "This group does not exist.");

	return json({
		name: group.name,
		quotes: await listQuotesMatching(group.id, {
			text: url.searchParams.get("content") || undefined,
			person: url.searchParams.get("person") || undefined,
		}),
		people: await listPeople(group.id),
	});
}
