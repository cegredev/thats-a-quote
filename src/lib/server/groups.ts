import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";
import { db } from "./db";

export type GroupRow = {
	id: string;
	name: string;
	password_hash: string | null;
	created_at: number;
};
export type Quote = {
	id: string;
	text: string;
	person: string;
	createdAt: number;
};

/** Create a new group and return its long unique id. */
export function createGroup(name: string, password: string | null): string {
	const id = nanoid(24);
	const passwordHash = password ? bcrypt.hashSync(password, 10) : null;
	db.prepare(
		"INSERT INTO groups (id, name, password_hash, created_at) VALUES (?, ?, ?, ?)",
	).run(id, name, passwordHash, Date.now());
	return id;
}

export function getGroup(id: string): GroupRow | undefined {
	return db.prepare("SELECT * FROM groups WHERE id = ?").get(id) as
		| GroupRow
		| undefined;
}

export function groupHasPassword(group: GroupRow): boolean {
	return Boolean(group.password_hash);
}

export function checkGroupPassword(group: GroupRow, password: string): boolean {
	if (!group.password_hash) return true;
	if (!password) return false;
	return bcrypt.compareSync(password, group.password_hash);
}

export function listQuotes(groupId: string): Quote[] {
	return db
		.prepare(
			"SELECT id, text, person, created_at as createdAt FROM quotes WHERE group_id = ? ORDER BY created_at DESC",
		)
		.all(groupId) as Quote[];
}

export function addQuote(groupId: string, text: string, person: string): Quote {
	const id = nanoid(16);
	const createdAt = Date.now();
	db.prepare(
		"INSERT INTO quotes (id, group_id, text, person, created_at) VALUES (?, ?, ?, ?, ?)",
	).run(id, groupId, text, person, createdAt);
	return { id, text, person, createdAt };
}

/** Distinct people who have been quoted in this group, most recently used first. */
export function listPeople(groupId: string): string[] {
	const rows = db
		.prepare(
			`SELECT person, MAX(created_at) as lastUsed
			 FROM quotes
			 WHERE group_id = ?
			 GROUP BY person COLLATE NOCASE
			 ORDER BY lastUsed DESC`,
		)
		.all(groupId);
	return (rows as Array<{ person: string }>).map((r) => r.person);
}
