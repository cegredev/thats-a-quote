import { sequence } from "@sveltejs/kit/hooks";
import type { Handle } from "@sveltejs/kit";
import { getTextDirection } from "$lib/paraglide/runtime";
import { paraglideMiddleware } from "$lib/paraglide/server";
import { auth } from "$lib/server/auth";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { building } from "$app/env";
import { logger } from "$lib/server/logging";
import { nanoid } from "nanoid";
import { DUMMY_DATA_INTERVAL_SECONDS } from "$app/env/public";

logger.info("thats-a-quote server started!");

const originalHandle: Handle = async ({ event, resolve }) => {
	// Fetch current session from Better Auth
	const session = await auth.api.getSession({
		headers: event.request.headers,
	});

	// Make session and user available on server
	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	}

	event.locals.logger = logger.child({ reqId: nanoid() });

	return svelteKitHandler({ event, resolve, auth, building });
};

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) =>
				html
					.replace("%paraglide.lang%", locale)
					.replace("%paraglide.dir%", getTextDirection(locale)),
		});
	});

export const handle = sequence(originalHandle, handleParaglide);

if (
	DUMMY_DATA_INTERVAL_SECONDS !== undefined &&
	DUMMY_DATA_INTERVAL_SECONDS >= 0
) {
	const { fillWithDummyData } = await import("$lib/server/db/dummy-data");

	await fillWithDummyData();

	if (DUMMY_DATA_INTERVAL_SECONDS > 0) {
		setInterval(async () => {
			console.log("Filling database with dummy data...");
			await fillWithDummyData();
		}, DUMMY_DATA_INTERVAL_SECONDS * 1000);
	}
}
