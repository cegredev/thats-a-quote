import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { db } from "./db";
import * as schema from "./db/schema";
import { sveltekitCookies } from "better-auth/svelte-kit";
import { getRequestEvent } from "$app/server";
import { BASE_URL, AUTH_SECRET } from "$app/env/private";

const createAuth = () =>
	betterAuth({
		database: drizzleAdapter(db(), {
			provider: "sqlite", // or "mysql", "sqlite"
			schema,
		}),
		secret: AUTH_SECRET,
		baseURL: BASE_URL,
		emailAndPassword: {
			enabled: true,
		},
		plugins: [
			// make sure this is the last plugin in the array
			sveltekitCookies(getRequestEvent),
		],
	});

type Auth = ReturnType<typeof createAuth>;

let _auth: Auth | undefined;

export const auth: () => Auth = () => {
	if (_auth !== undefined) return _auth;

	_auth = createAuth();

	return _auth;
};
