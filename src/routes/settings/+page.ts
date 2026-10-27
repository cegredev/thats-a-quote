import { getActivePushSubscription } from "#lib/client/push.svelte.ts";
import type { PageLoad } from "./$types";

export const load: PageLoad = async (req) => {
	const pushSubscription = await getActivePushSubscription(
		req.data.vapidPublicKey,
	);

	return {
		pushPermission:
			pushSubscription === "install-pwa-first"
				? ("install-pwa-first" as const)
				: pushSubscription !== null,
		...req.data,
	};
};
