import { json, error } from '@sveltejs/kit';
import { verifyAccount } from '$lib/server/accounts.js';

export async function POST({ request }) {
	const body = await request.json().catch(() => ({}));
	const username = (body.username || '').trim();
	const password = body.password || '';

	const account = verifyAccount(username, password);
	if (!account) throw error(401, 'Incorrect username or password.');

	return json({ username: account.username, vault: JSON.parse(account.vault) });
}
