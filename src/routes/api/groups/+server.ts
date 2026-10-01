import { json } from "@sveltejs/kit";
import { groupsCrud } from "$lib/server/db/crud";

export async function GET({ url }) {
	const ids = url.searchParams.getAll("id");

	const groupsPagination = await groupsCrud.list({
		filters: {
			id: {
				in: ids,
			},
		},
	});

	const groups = groupsPagination.results;
	return json(groups);
}
