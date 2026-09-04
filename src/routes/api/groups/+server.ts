import { json, error } from '@sveltejs/kit';
import { createGroup } from '$lib/server/groups';

export async function POST({ request }) {
	const body = await request.json().catch(() => ({}));
	const name = (body.name || '').trim();
	const password = (body.password || '').trim();

	if (!name) throw error(400, 'A group name is required.');
	if (name.length > 80) throw error(400, 'Group name must be under 80 characters.');
	if (password.length > 200) throw error(400, 'Password is too long.');

	const id = createGroup(name, password || null);
	return json({ id, name });
}
