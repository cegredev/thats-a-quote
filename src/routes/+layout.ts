import { authClient } from "$lib/client/frontend-auth";
import { migrateStorage } from "$lib/client/storage";
import type { LayoutLoad } from "./$types";

export const ssr = false;

export const load: LayoutLoad = async ({ data }) => {
	migrateStorage();

	const session =
		data.session && data.user
			? {
					session: data.session,
					user: data.user,
				}
			: null;

	authClient.hydrateSession(session);
};
