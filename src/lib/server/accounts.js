import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';
import { db } from './db.js';

export function getAccount(username) {
	return db.prepare('SELECT * FROM accounts WHERE username = ? COLLATE NOCASE').get(username);
}

export function createAccount(username, password) {
	const id = nanoid(16);
	const passwordHash = bcrypt.hashSync(password, 10);
	db.prepare(
		'INSERT INTO accounts (id, username, password_hash, vault, updated_at) VALUES (?, ?, ?, ?, ?)'
	).run(id, username, passwordHash, '[]', Date.now());
	return { id, username, vault: '[]' };
}

export function verifyAccount(username, password) {
	const account = getAccount(username);
	if (!account) return null;
	if (!bcrypt.compareSync(password, account.password_hash)) return null;
	return account;
}

export function saveVault(username, vault) {
	db.prepare('UPDATE accounts SET vault = ?, updated_at = ? WHERE username = ? COLLATE NOCASE').run(
		JSON.stringify(vault),
		Date.now(),
		username
	);
}

/** Union two vaults (lists of {id, name, password}) by group id. Client entries win on conflict
 *  since the browser is the source of truth for a password the user just typed. */
export function mergeVaults(serverVault, clientVault) {
	const byId = new Map();
	for (const entry of serverVault) byId.set(entry.id, entry);
	for (const entry of clientVault) byId.set(entry.id, entry);
	return Array.from(byId.values());
}
