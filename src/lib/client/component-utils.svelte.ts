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

export const updateUrlParameters = async (
	entries: [string, string][],
	searchParams?: URLSearchParams,
) => {
	const targetParams = new URLSearchParams(searchParams);
	entries.forEach(([k, v]) => targetParams.set(k, v));

	await goto(`?${targetParams.toString()}`, {
		keepFocus: true,
		noScroll: true,
	});
};

export const setPaginationPerPage = async (
	perPage: number,
	currentPerPage: number,
	searchParams?: URLSearchParams,
) => {
	const parameters: [string, string][] = [["perPage", String(perPage)]];

	const page = parseInt(searchParams?.get("page") ?? "");
	if (!isNaN(page)) {
		const currentlySkippedItems = currentPerPage * (page - 1);
		const newPage = Math.floor(currentlySkippedItems / perPage) + 1;
		console.log(page, currentPerPage, perPage);
		console.log("newPage", newPage);
		parameters.push(["page", String(newPage)]);
	}

	await updateUrlParameters(parameters, searchParams);
};

export const setPaginationPage = async (
	page: number,
	searchParams?: URLSearchParams,
) => {
	await updateUrlParameters([["page", String(page)]], searchParams);
};

export const shiftPaginationPage = async (
	url: URL,
	amount: number,
	max?: number,
) => {
	const page = parseInt(url.searchParams.get("page") ?? "");

	let targetPage: number = isNaN(page) ? 1 : page;

	targetPage = Math.min(Math.max(1, targetPage + amount), max ?? Infinity);

	await setPaginationPage(targetPage, url.searchParams);
};
