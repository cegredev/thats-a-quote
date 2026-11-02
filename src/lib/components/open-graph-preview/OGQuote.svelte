<svelte:options css="injected" />

<script lang="ts">
	import type { Quote } from "#lib/zod-schemas.ts";
	import { m } from "#lib/paraglide/messages.js";
	import { getLocale } from "#lib/paraglide/runtime.js";

	import { OPEN_GRAPH_IMAGE_LAYOUT } from "#lib/open-graph.ts";

	let { quote }: { quote: Quote } = $props();

	function formatDate(ts: Date): string {
		return ts.toLocaleString(getLocale() === "de" ? "de-DE" : "en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		});
	}
</script>

<div
	style={`display: flex; flex-direction: column; justify-content: center; width: 100%; height: 100%; padding: ${OPEN_GRAPH_IMAGE_LAYOUT.paddingTop}px ${OPEN_GRAPH_IMAGE_LAYOUT.horizontalPadding}px ${OPEN_GRAPH_IMAGE_LAYOUT.paddingBottom}px; background-color: #f5f5f5; color: #101011; text-shadow: none; -webkit-text-stroke: 0 transparent;`}
>
	<p
		style={`margin: 0; font-size: ${OPEN_GRAPH_IMAGE_LAYOUT.quoteFontSize}px; line-height: ${OPEN_GRAPH_IMAGE_LAYOUT.quoteLineHeight}; text-align: center;`}
	>
		&ldquo;{quote.text}&rdquo;
	</p>
	<p
		style={`margin: ${OPEN_GRAPH_IMAGE_LAYOUT.attributionMarginTop}px 0 0; color: #a1a1aa; font-size: ${OPEN_GRAPH_IMAGE_LAYOUT.attributionFontSize}px; line-height: ${OPEN_GRAPH_IMAGE_LAYOUT.attributionLineHeight}; text-align: center;`}
	>
		<span style:font-style={quote.person ? "normal" : "italic"}>
			— {quote.person ?? m.group_anonymousPersonDisplay()}
		</span>
		· {formatDate(quote.quotedAt)}
	</p>
</div>
