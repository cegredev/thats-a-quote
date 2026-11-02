import { ImageResponse } from "@ethercorps/sveltekit-og";
import { error, type RequestHandler } from "@sveltejs/kit";
import OGQuote from "#lib/components/open-graph-preview/OGQuote.svelte";
import { getQuoteImageDimensions } from "#lib/open-graph.ts";
import { crud } from "#lib/server/db/crud.ts";

export const GET: RequestHandler = async ({ params }) => {
	const id = params.id ?? error(400, "Missing id parameter");

	const quote = await crud().quotes.findOne({
		id: id,
	});
	if (!quote) error(404, "Quote not found");

	const dimensions = getQuoteImageDimensions(quote.text);
	const response = new ImageResponse(
		OGQuote,
		{
			...dimensions,
			format: "png",
		},
		{ quote },
	);

	try {
		const body = await response.arrayBuffer();
		return new Response(body, {
			status: response.status,
			statusText: response.statusText,
			headers: response.headers,
		});
	} catch (cause) {
		console.error("PNG response failed:", cause);
		if (cause instanceof Error && "originalError" in cause) {
			console.error("Underlying ReSVG error:", cause.originalError);
		}
		throw cause;
	}
};
