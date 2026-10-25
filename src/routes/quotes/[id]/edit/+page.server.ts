import type { PageServerLoad } from "./$types";
import { error, redirect } from "@sveltejs/kit";
import { crud } from "#lib/server/db/crud.js";

export const load: PageServerLoad = async ({ params }) => {
	const quoteId = params.id;
	if (!quoteId) error(400, "No quote id param");

	const quote = await crud().quotes.findOne({
		id: quoteId,
	});
	if (!quote) error(404, "no quote to id");

	redirect(307, `/group/${quote.groupId}?edit=${encodeURIComponent(quote.id)}`);
};
