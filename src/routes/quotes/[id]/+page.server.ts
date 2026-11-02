import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { BASE_URL } from "$app/env/private";
import { getQuoteImageDimensions } from "#lib/open-graph.ts";
import { crud } from "#lib/server/db/crud.ts";

export const load: PageServerLoad = async ({ params }) => {
	const id = params.id ?? error(400, "Missing id parameter");
	const quote = await crud().quotes.findOne({ id });
	if (!quote) error(404, "Quote not found");

	const preview = {
		url: BASE_URL + "/quotes/" + id + ".png",
		...getQuoteImageDimensions(quote.text),
	};

	return {
		preview,
	};
};
