import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';
import { db } from './db.js';

/** Create a new group and return its long unique id. */
export function createGroup(name, password) {
	const id = nanoid(24);
	const passwordHash = password ? bcrypt.hashSync(password, 10) : null;
	db.prepare('INSERT INTO groups (id, name, password_hash, created_at) VALUES (?, ?, ?, ?)').run(
		id,
		name,
		passwordHash,
		Date.now()
	);
	return id;
}

export function getGroup(id) {
	return db.prepare('SELECT * FROM groups WHERE id = ?').get(id);
}

export function groupHasPassword(group) {
	return Boolean(group.password_hash);
}

export function checkGroupPassword(group, password) {
	if (!group.password_hash) return true;
	if (!password) return false;
	return bcrypt.compareSync(password, group.password_hash);
}

export function listQuotes(groupId) {
	return db
		.prepare(
			'SELECT id, text, person, created_at as createdAt FROM quotes WHERE group_id = ? ORDER BY created_at DESC'
		)
		.all(groupId);
}

export function addQuote(groupId, text, person) {
	const id = nanoid(16);
	const createdAt = Date.now();
	db.prepare(
		'INSERT INTO quotes (id, group_id, text, person, created_at) VALUES (?, ?, ?, ?, ?)'
	).run(id, groupId, text, person, createdAt);
	return { id, text, person, createdAt };
}

/** Distinct people who have been quoted in this group, most recently used first. */
export function listPeople(groupId) {
	const rows = db
		.prepare(
			`SELECT person, MAX(created_at) as lastUsed
			 FROM quotes
			 WHERE group_id = ?
			 GROUP BY person COLLATE NOCASE
			 ORDER BY lastUsed DESC`
		)
		.all(groupId);
	return rows.map((r) => r.person);
}
