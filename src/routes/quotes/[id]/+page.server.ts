import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { BASE_URL } from "$app/env/private";

export const load: PageServerLoad = async ({ params }) => {
	const id = params.id ?? error(400, "Missing id parameter");

	const preview = {
		url: BASE_URL + "/quotes/" + id + ".png",
		width: 1200,
		height: 630,
	};

	return {
		preview,
	};
};
