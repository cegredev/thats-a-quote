import { json, error } from "@sveltejs/kit";
import { createGroup, getGroup } from "$lib/server/groups";

export async function POST({ request }) {
	const body = await request.json().catch(() => ({}));
	const name = (body.name || "").trim();
	const password = (body.password || "").trim();
	const customId = typeof body.id === "string" ? body.id.trim() : "";

	if (!name) throw error(400, "A group name is required.");
	if (name.length > 80)
		throw error(400, "Group name must be under 80 characters.");
	if (password.length > 200) throw error(400, "Password is too long.");
	if (customId && !/^[A-Za-z0-9_-]{3,64}$/.test(customId)) {
		throw error(400, "Custom group IDs must be 3-64 URL-safe characters.");
	}
	if (customId && getGroup(customId)) {
		throw error(409, "That group ID is already taken.");
	}

	const id = createGroup(name, password || null, customId || undefined);
	return json({ id, name });
}
