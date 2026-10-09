import { getActivePushSubscription } from "#lib/client/push.ts";
import type { PageLoad } from "./$types";

export const load: PageLoad = async (req) => {
	const pushPermission = (await getActivePushSubscription()) !== null;

	return {
		pushPermission,
	};
};
