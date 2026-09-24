import { migrateStorage } from "$lib/client/storage.svelte";
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

	return {
		/**
		 * Needed to hydrate the better auth session which we do
		 * to avoid flickering of the login state on page load.
		 * We do the hydration in the layout svelte component and
		 * not in the load function, to remove a warning about not
		 * using the load's fetch function.
		 */
		session,
	};
};
