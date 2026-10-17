import { sequence, type Handle } from "@sveltejs/kit/hooks";
import { getTextDirection } from "#lib/paraglide/runtime.js";
import { paraglideMiddleware } from "#lib/paraglide/server.js";
import { auth } from "#lib/server/auth.js";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { building } from "$app/env";
import { logger } from "#lib/server/logging.js";
import { nanoid } from "nanoid";
import { FILL_WITH_DUMMY_DATA, RESET_INTERVAL_SECONDS } from "$app/env/private";

logger.info("thats-a-quote started!");

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
		// @ts-ignore
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) =>
				html
					.replace("%paraglide.lang%", locale)
					.replace("%paraglide.dir%", getTextDirection(locale)),
		});
	});

export const handle = sequence(originalHandle, handleParaglide);

if (FILL_WITH_DUMMY_DATA) {
	const { fillWithDummyData } = await import("#lib/server/db/dummy-data.js");

	await fillWithDummyData();
}

if (RESET_INTERVAL_SECONDS && RESET_INTERVAL_SECONDS > 0) {
	const { resetDatabase } = await import("#lib/server/db/dummy-data.js");

	setInterval(async () => {
		logger.info("Resetting database...");
		await resetDatabase();
	}, RESET_INTERVAL_SECONDS * 1000);
}
