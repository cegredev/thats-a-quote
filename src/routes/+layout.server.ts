import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
	const session =
		locals.session && locals.user
			? {
					session: locals.session,
					user: locals.user,
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
