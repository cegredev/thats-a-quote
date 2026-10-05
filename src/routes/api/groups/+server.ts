import { groupsCrud } from "#lib/server/db/crud.js";

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
	return Response.json(groups);
}
