export const OPEN_GRAPH_IMAGE_LAYOUT = {
	width: 1200,
	height: 630,
	horizontalPadding: 64,
	paddingTop: 64,
	paddingBottom: 64,
	maxQuoteFontSize: 48,
	minQuoteFontSize: 12,
	quoteLineHeight: 1.2,
	attributionFontSize: 22,
	attributionLineHeight: 1.2,
	attributionMarginTop: 32,
} as const;

export function getQuoteImageLayout(quoteText: string) {
	const contentWidth =
		OPEN_GRAPH_IMAGE_LAYOUT.width -
		2 * OPEN_GRAPH_IMAGE_LAYOUT.horizontalPadding;
	const quoteLength = Array.from(`“${quoteText}”`).length;
	const attributionHeight =
		OPEN_GRAPH_IMAGE_LAYOUT.attributionFontSize *
		OPEN_GRAPH_IMAGE_LAYOUT.attributionLineHeight;
	const availableQuoteHeight =
		OPEN_GRAPH_IMAGE_LAYOUT.height -
		OPEN_GRAPH_IMAGE_LAYOUT.paddingTop -
		OPEN_GRAPH_IMAGE_LAYOUT.paddingBottom -
		OPEN_GRAPH_IMAGE_LAYOUT.attributionMarginTop -
		attributionHeight;

	function fits(fontSize: number): boolean {
		const estimatedCharacterWidth = fontSize * 0.6;
		const charactersPerLine = Math.max(
			1,
			Math.floor(contentWidth / estimatedCharacterWidth),
		);
		const lineCount = Math.max(
			1,
			Math.ceil(quoteLength / charactersPerLine),
		);
		const quoteHeight =
			lineCount * fontSize * OPEN_GRAPH_IMAGE_LAYOUT.quoteLineHeight;

		return quoteHeight <= availableQuoteHeight;
	}

	let minFontSize: number = OPEN_GRAPH_IMAGE_LAYOUT.minQuoteFontSize;
	let maxFontSize: number = OPEN_GRAPH_IMAGE_LAYOUT.maxQuoteFontSize;
	while (minFontSize < maxFontSize) {
		const candidate = Math.ceil((minFontSize + maxFontSize) / 2);
		if (fits(candidate)) {
			minFontSize = candidate;
		} else {
			maxFontSize = candidate - 1;
		}
	}

	return {
		width: OPEN_GRAPH_IMAGE_LAYOUT.width,
		height: OPEN_GRAPH_IMAGE_LAYOUT.height,
		quoteFontSize: minFontSize,
	};
}
