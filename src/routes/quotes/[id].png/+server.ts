import { ImageResponse } from "@ethercorps/sveltekit-og";
import { error, type RequestHandler } from "@sveltejs/kit";
import OGQuote from "#lib/components/open-graph-preview/OGQuote.svelte";
import { crud } from "#lib/server/db/crud.ts";

// This is optional, use it if you want to generate OG image at build time.
export const prerender = false;

export const GET: RequestHandler = async ({ params }) => {
	const id = params.id ?? error(400, "Missing id parameter");

	const quote = await crud().quotes.findOne({
		id: id,
	});
	if (!quote) error(404, "Quote not found");

	return new ImageResponse(
		OGQuote,
		{
			width: 1200,
			height: 630,
			format: "png",
		},
		{ quote },
	);
};
