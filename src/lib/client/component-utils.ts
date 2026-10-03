import { goto } from "$app/navigation";

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

export const updateUrlParameter = async (
	key: string,
	value: string,
	searchParams?: URLSearchParams,
) => {
	const targetParams = new URLSearchParams(searchParams);
	targetParams.set(key, value);

	await goto(`?${targetParams.toString()}`, {
		keepFocus: true,
		noScroll: true,
	});
};

export const setPaginationPerPage = async (
	perPage: number,
	searchParams?: URLSearchParams,
) => {
	await updateUrlParameter("perPage", String(perPage), searchParams);
};

export const setPaginationPage = async (
	page: number,
	searchParams?: URLSearchParams,
) => {
	await updateUrlParameter("page", String(page), searchParams);
};

export const shiftPaginationPage = async (
	url: URL,
	amount: number,
	max?: number,
) => {
	const page = parseInt(url.searchParams.get("page") ?? "");

	let targetPage: number = isNaN(page) ? 1 : page;

	targetPage += Math.min(Math.max(1, amount), max ?? Infinity);

	await setPaginationPage(targetPage, url.searchParams);
};
