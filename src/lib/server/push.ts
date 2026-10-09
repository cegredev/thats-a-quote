import webpush from "web-push";
import { getVapidKeys } from "./vapid";
import { VAPID_SUBJECT } from "$app/env/private";
import { db } from "./db";
import { pushSubscriptions } from "./db/schema";
import { inArray } from "drizzle-orm";

let configured: boolean = false;

function configure(subject: string) {
	const keys = getVapidKeys();
	webpush.setVapidDetails(subject, keys.publicKey, keys.privateKey);
	configured = true;
}

// const toSubscription = (endpoint: string): webpush.PushSubscription => ({

// 	endpoint: endpoint,
//   keys: { p256dh: row.p256dh, auth: row.auth }
// });

async function _sendPush(
	sub: webpush.PushSubscription,
	payload: { title: string; body: string; url?: string },
) {
	if (!VAPID_SUBJECT)
		throw new Error("No VAPID_SUBJECT configured, but needed for push.");

	if (!configured) configure(VAPID_SUBJECT);

	try {
		await webpush.sendNotification(sub, JSON.stringify(payload), {
			TTL: 3600,
		});
	} catch (err: any) {
		if (err.statusCode === 404 || err.statusCode === 410) {
			// delete the stale subscription from your DB
		} else {
			throw err;
		}
	}
}

export const sendPush = async (
	userIds: string[],
	options: {
		title: string;
		body: string;
	},
) => {
	const subscriptions = await db
		.select()
		.from(pushSubscriptions)
		.where(inArray(pushSubscriptions.userId, userIds));

	await Promise.all(
		subscriptions.map((s) =>
			_sendPush(
				{
					endpoint: s.endpoint,
					keys: {
						auth: s.auth,
						p256dh: s.p256dh,
					},
				},
				options,
			),
		),
	);
};
