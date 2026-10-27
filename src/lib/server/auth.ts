import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { db } from "./db";
import * as schema from "./db/schema";
import { sveltekitCookies } from "better-auth/svelte-kit";
import { getRequestEvent } from "$app/server";
import { BASE_URL, AUTH_SECRET, AUTH_SECRET_FILE } from "$app/env/private";
import { readFileSync, existsSync } from "node:fs";
import { username } from "better-auth/plugins";

const createAuth = () => {
	let secret: string | undefined = AUTH_SECRET;
	if (!secret && AUTH_SECRET_FILE) {
		if (!existsSync(AUTH_SECRET_FILE))
			throw new Error("no auth secret given!");

		secret = readFileSync(AUTH_SECRET_FILE).toString();
	}

	if (!secret) throw new Error("no auth secret given!");

	return betterAuth({
		database: drizzleAdapter(db(), {
			provider: "sqlite", // or "mysql", "sqlite"
			schema,
		}),
		secret,
		baseURL: BASE_URL,
		emailAndPassword: {
			enabled: true,
		},
		plugins: [
			username(),
			// make sure this is the last plugin in the array
			sveltekitCookies(getRequestEvent),
		],
	});
};

type Auth = ReturnType<typeof createAuth>;

let _auth: Auth | undefined;

export const auth: () => Auth = () => {
	if (_auth !== undefined) return _auth;

	_auth = createAuth();

	return _auth;
};
