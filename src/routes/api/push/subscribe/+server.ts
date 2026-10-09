import { db } from "#lib/server/db.ts";
import { pushSubscriptions } from "#lib/server/db/schema.ts";
import { eq } from "drizzle-orm";
import type { RequestHandler } from "./$types";
import { error } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request, locals }) => {
	const sub = (await request.json()) as PushSubscriptionJSON;

	if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
		return Response.json(
			{ error: "Invalid subscription" },
			{ status: 400 },
		);
	}

	const userId = locals.user?.id;

	await db
		.insert(pushSubscriptions)
		.values({
			endpoint: sub.endpoint,
			p256dh: sub.keys.p256dh,
			auth: sub.keys.auth,
			userId,
		})
		.onConflictDoUpdate({
			target: pushSubscriptions.endpoint,
			set: { auth: sub.keys.auth, p256dh: sub.keys.p256dh, userId },
		});

	return Response.json({ ok: true });
};

export const DELETE: RequestHandler = async ({ request }) => {
	const { endpoint } = (await request.json()) as PushSubscriptionJSON;

	if (!endpoint) error(400, "missing endpoint");

	await db
		.delete(pushSubscriptions)
		.where(eq(pushSubscriptions.endpoint, endpoint));

	return Response.json({ ok: true });
};
