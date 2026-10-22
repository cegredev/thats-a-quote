import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";
import { crud } from "#lib/server/db/crud.js";

export const load: PageServerLoad = async ({ params, url, locals }) => {
	const quoteId = params.id;

	const quote = await crud().quotes.findOne({
		id: quoteId,
	});
	if (!quote) error(404, "Quote not found");

	return {
		quote,
	};
};

export const actions = {};
