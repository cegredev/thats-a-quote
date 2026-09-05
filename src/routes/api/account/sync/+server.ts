import { json, error } from "@sveltejs/kit";
import { verifyAccount, saveVault, mergeVaults } from "$lib/server/accounts";

export async function POST({ request }) {
	const body = await request.json().catch(() => ({}));
	const username = (body.username || "").trim();
	const password = body.password || "";
	const clientVault = Array.isArray(body.vault) ? body.vault : [];
	const removedGroups = Array.isArray(body.removedGroups)
		? body.removedGroups.filter(
				(groupId: unknown): groupId is string =>
					typeof groupId === "string",
			)
		: [];

	const account = verifyAccount(username, password);
	if (!account) throw error(401, "Incorrect username or password.");

	const serverVault = JSON.parse(account.vault);
	const merged = mergeVaults(serverVault, clientVault, removedGroups);
	saveVault(account.username, merged);

	return json({ vault: merged });
}
