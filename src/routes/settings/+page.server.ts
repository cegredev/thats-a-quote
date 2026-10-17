import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (req) => {
	const isLoggedIn = req.locals.user?.id !== undefined;

	return {
		isLoggedIn,
	};
};
