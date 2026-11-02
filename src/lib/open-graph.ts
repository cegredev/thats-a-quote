export const OPEN_GRAPH_IMAGE_LAYOUT = {
	width: 1200,
	horizontalPadding: 64,
	paddingTop: 64,
	paddingBottom: 64,
	quoteFontSize: 48,
	quoteLineHeight: 1.2,
	attributionFontSize: 22,
	attributionLineHeight: 1.2,
	attributionMarginTop: 32,
} as const;

export function getQuoteImageDimensions(quoteText: string) {
	const contentWidth =
		OPEN_GRAPH_IMAGE_LAYOUT.width -
		2 * OPEN_GRAPH_IMAGE_LAYOUT.horizontalPadding;
	const estimatedCharacterWidth = OPEN_GRAPH_IMAGE_LAYOUT.quoteFontSize * 0.55;
	const charactersPerLine = Math.max(
		1,
		Math.floor(contentWidth / estimatedCharacterWidth),
	);
	const quoteLength = Array.from(`“${quoteText}”`).length;
	const quoteLineCount = Math.max(
		1,
		Math.ceil(quoteLength / charactersPerLine),
	);
	const quoteHeight =
		quoteLineCount *
		OPEN_GRAPH_IMAGE_LAYOUT.quoteFontSize *
		OPEN_GRAPH_IMAGE_LAYOUT.quoteLineHeight;
	const attributionHeight =
		OPEN_GRAPH_IMAGE_LAYOUT.attributionFontSize *
		OPEN_GRAPH_IMAGE_LAYOUT.attributionLineHeight;

	return {
		width: OPEN_GRAPH_IMAGE_LAYOUT.width,
		height: Math.ceil(
			OPEN_GRAPH_IMAGE_LAYOUT.paddingTop +
				quoteHeight +
				OPEN_GRAPH_IMAGE_LAYOUT.attributionMarginTop +
				attributionHeight +
				OPEN_GRAPH_IMAGE_LAYOUT.paddingBottom,
		),
	};
}
