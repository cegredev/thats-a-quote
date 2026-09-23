import { json } from "@sveltejs/kit";
import { getGroupDetails } from "$lib/server/groups";

export async function GET({ url }) {
	const ids = url.searchParams.getAll("id");

	const groups = await getGroupDetails(ids);

	return json(groups);
}
