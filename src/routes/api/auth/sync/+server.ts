import { json, error } from "@sveltejs/kit";
import {
	verifyAccount,
	saveVault,
	mergeVaults,
	getAccount,
} from "$lib/server/accounts";
import { auth } from "$lib/server/auth.js";

export async function POST({ request }) {
	console.log("syncing");

	const body = await request.json().catch(() => ({}));
	const clientVault = Array.isArray(body.vault) ? body.vault : [];
	const removedGroups = Array.isArray(body.removedGroups)
		? body.removedGroups.filter(
				(groupId: unknown): groupId is string =>
					typeof groupId === "string",
			)
		: [];

	const session = await auth.api.getSession({
		headers: request.headers,
	});

	if (!session) throw error(401, "Not authenticated");

	const account = await getAccount(session.user.id);
	if (!account) throw error(404, "user not found.");

	const serverVault = JSON.parse(account.vault);
	const merged = mergeVaults(serverVault, clientVault, removedGroups);
	await saveVault(account.username, merged);

	return json({ vault: merged });
}
