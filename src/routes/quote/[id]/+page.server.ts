import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { BASE_URL } from "$app/env/private";
import { getQuoteImageLayout } from "#lib/open-graph.ts";
import { crud } from "#lib/server/db/crud.ts";
import type { Quote } from "#lib/zod-schemas.ts";

export const load: PageServerLoad = async ({ params, url }) => {
	const id = params.id ?? error(400, "Missing id parameter");
	const quote: Quote | null = await crud().quotes.findOne({ id });
	if (!quote) error(404, "Quote not found");

	const noImage = url.searchParams.has("noImage");
	const preview = noImage ? undefined : generatePreviewInfo(quote);

	return {
		preview,
		quote: {
			id: quote.id,
			text: quote.text,
			person: quote.person,
			groupId: quote.groupId,
		},
	};
};

const generatePreviewInfo = (quote: Quote) => {
	const { width, height } = getQuoteImageLayout(quote.text);
	const preview = {
		url: BASE_URL + "/quote/" + quote.id + ".png",
		width,
		height,
	};
	return preview;
};
