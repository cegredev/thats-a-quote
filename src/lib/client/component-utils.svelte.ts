import { goto } from "$app/navigation";
import { tick } from "svelte";
import type { Action } from "svelte/action";

// TODO: Convert to attachment
export const autogrow: Action<HTMLElement, unknown> = (
	node: HTMLElement,
	_value?: unknown,
) => {
	function adjustHeight() {
		node.style.height = "auto";
		node.style.height = `${node.scrollHeight}px`;
	}

	node.addEventListener("input", adjustHeight);
	void tick().then(adjustHeight);

	return {
		update() {
			void tick().then(adjustHeight);
		},
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
		reset: false,
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

export function toDateTimeLocal(date: Date): string {
	const offset = date.getTimezoneOffset();
	const localDate = new Date(date.getTime() - offset * 60000);
	return localDate.toISOString().slice(0, 19);
}
