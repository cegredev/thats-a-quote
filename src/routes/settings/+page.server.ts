import type { PageServerLoad } from "./$types";
import { VAPID_SUBJECT } from "$app/env/private";

export const load: PageServerLoad = async (req) => {
	const isLoggedIn = req.locals.user?.id !== undefined;
	const pushServiceEnabled = VAPID_SUBJECT !== undefined;

	return {
		isLoggedIn,
		pushServiceEnabled,
	};
};
