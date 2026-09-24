import type { Group } from "$lib/types";

type FetchFunction = typeof fetch;

export async function api<T>(
	url: string,
	fetch: FetchFunction,
	options?: RequestInit,
): Promise<
	| {
			ok: true;
			data: T;
	  }
	| {
			ok: false;
			error: any;
	  }
> {
	const response = await fetch(url, {
		headers: {
			"Content-Type": "application/json",
		},
		body: options?.body ? JSON.stringify(options.body) : undefined,
		...options,
	});
	const data = await response.json();

	if (!response.ok) {
		return { ok: false, error: data };
	}

	return { ok: true, data };
}

export const groupsApi = (customFetch?: FetchFunction) => ({
	getByIDs: async (ids: string[]) =>
		api<Group[]>(
			`/api/groups?${ids.map((id) => `id=${encodeURIComponent(id)}`).join("&")}`,
			customFetch ?? fetch,
		),
});
