export const autogrow = (node: HTMLTextAreaElement) => {
	function adjustHeight() {
		node.style.height = "auto"; // Reset the height
		node.style.height = `${node.scrollHeight}px`; // Set height to fit content
	}

	// Attach the `input` event listener
	node.addEventListener("input", adjustHeight);

	// Adjust height on mount
	adjustHeight();

	return {
		destroy() {
			node.removeEventListener("input", adjustHeight);
		},
	};
};
