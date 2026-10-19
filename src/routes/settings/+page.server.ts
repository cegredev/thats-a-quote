import type { PageServerLoad } from "./$types";
import { VAPID_SUBJECT } from "$app/env/private";
import { getVapidKeys } from "#lib/server/push-vapid.ts";

export const load: PageServerLoad = async (req) => {
	const isLoggedIn = req.locals.user?.id !== undefined;
	const pushServiceEnabled = VAPID_SUBJECT !== undefined;
	const publicKey = (await getVapidKeys()).publicKey;

	return {
		isLoggedIn,
		pushServiceEnabled,
		vapidPublicKey: publicKey,
	};
};
