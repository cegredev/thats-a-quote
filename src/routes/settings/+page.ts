import { getActivePushSubscription } from "#lib/client/push.svelte.ts";
import type { PageLoad } from "./$types";

export const load: PageLoad = async (req) => {
	const pushPermission =
		(await getActivePushSubscription(req.data.vapidPublicKey)) !== null;

	return {
		pushPermission,
		...req.data,
	};
};
