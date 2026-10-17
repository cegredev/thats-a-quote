import webpush from "web-push";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { existsSync } from "node:fs";
import { BASE_DIR, VAPID_SUBJECT } from "$app/env/private";
import { db } from "./db";
import { pushSubscriptions } from "./db/schema";
import { inArray } from "drizzle-orm";

const keysFilePath = () => path.join(BASE_DIR, "data", "vapid.json");

type VapidKeys = { publicKey: string; privateKey: string };

let _keys: VapidKeys | undefined = undefined;

export async function getVapidKeys(): Promise<VapidKeys> {
	if (_keys !== undefined) return _keys;

	_keys = await loadOrCreate();

	return _keys;
}

async function loadOrCreate(): Promise<VapidKeys> {
	const existing = await tryReadStoredKeys();
	if (existing) return existing;

	const fresh = webpush.generateVAPIDKeys();
	await insertKeysIfAbsent(fresh);

	return (await tryReadStoredKeys()) ?? fresh;
}

async function tryReadStoredKeys() {
	if (existsSync(keysFilePath())) {
		try {
			return JSON.parse(await readFile(keysFilePath(), "utf8"));
		} catch {
			return null;
		}
	}

	return null;
}

async function insertKeysIfAbsent(keys: VapidKeys) {
	if (existsSync(keysFilePath())) return;

	await mkdir(path.dirname(keysFilePath()), { recursive: true });

	// flag 'wx' fails if the file exists, which gives you insert-if-absent
	await writeFile(keysFilePath(), JSON.stringify(keys), {
		mode: 0o600, // only the file owner can read and modify it
	});
}

let configured: boolean = false;

async function configure(subject: string) {
	const keys = await getVapidKeys();
	webpush.setVapidDetails(subject, keys.publicKey, keys.privateKey);
	configured = true;
}

async function _sendPush(
	sub: webpush.PushSubscription,
	payload: { title: string; message: string; url?: string },
) {
	if (!VAPID_SUBJECT)
		throw new Error("No VAPID_SUBJECT configured, but needed for push.");

	if (!configured) await configure(VAPID_SUBJECT);

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
		message: string;
	},
) => {
	const subscriptions = await db()
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
