import { ImageResponse } from "@ethercorps/sveltekit-og";
import { error, type RequestHandler } from "@sveltejs/kit";
import OGQuote from "#lib/components/open-graph-preview/OGQuote.svelte";
import { getQuoteImageLayout } from "#lib/open-graph.ts";
import { crud } from "#lib/server/db/crud.ts";

export const GET: RequestHandler = async ({ params }) => {
	const id = params.id ?? error(400, "Missing id parameter");

	const quote = await crud().quotes.findOne({
		id: id,
	});
	if (!quote) error(404, "Quote not found");

	const layout = getQuoteImageLayout(quote.text);
	const response = new ImageResponse(
		OGQuote,
		{
			width: layout.width,
			height: layout.height,
			format: "png",
		},
		{ quote, quoteFontSize: layout.quoteFontSize },
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
