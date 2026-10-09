import webpush from "web-push";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { existsSync } from "node:fs";
import { DATA_DIR } from "$app/env/private";

const keysFilePath = path.join(DATA_DIR, "vapid.json");

type VapidKeys = { publicKey: string; privateKey: string };

let keys: VapidKeys = await loadOrCreate();

export function getVapidKeys(): VapidKeys {
	return keys;
}

async function loadOrCreate(): Promise<VapidKeys> {
	const existing = await tryReadStoredKeys();
	if (existing) return existing;

	const fresh = webpush.generateVAPIDKeys();
	await insertKeysIfAbsent(fresh);

	return (await tryReadStoredKeys()) ?? fresh;
}

async function tryReadStoredKeys() {
	if (existsSync(keysFilePath)) {
		try {
			return JSON.parse(await readFile(keysFilePath, "utf8"));
		} catch {
			return null;
		}
	}

	return null;
}

async function insertKeysIfAbsent(keys: VapidKeys) {
	if (existsSync(keysFilePath)) return;

	await mkdir(path.dirname(keysFilePath), { recursive: true });

	// flag 'wx' fails if the file exists, which gives you insert-if-absent
	await writeFile(keysFilePath, JSON.stringify(keys), {
		mode: 0o600, // only the file owner can read and modify it
	});
}
