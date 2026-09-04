import { json, error } from '@sveltejs/kit';
import { getAccount, createAccount } from '$lib/server/accounts.js';

export async function POST({ request }) {
	const body = await request.json().catch(() => ({}));
	const username = (body.username || '').trim();
	const password = body.password || '';

	if (username.length < 3 || username.length > 40) {
		throw error(400, 'Username must be between 3 and 40 characters.');
	}
	if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
		throw error(400, 'Username can only contain letters, numbers, dots, dashes and underscores.');
	}
	if (password.length < 6) {
		throw error(400, 'Password must be at least 6 characters.');
	}
	if (getAccount(username)) {
		throw error(409, 'That username is already taken.');
	}

	const account = createAccount(username, password);
	return json({ username: account.username, vault: [] });
}
