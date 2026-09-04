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
	quotedAt: number;
};

/** Create a new group and return its long unique id. */
export function createGroup(
	name: string,
	password: string | null,
	customId?: string,
): string {
	const id = customId || nanoid(24);
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
	return listQuotesMatching(groupId, {});
}

export type QuoteSearch = {
	content?: string;
	person?: string;
};

export function listQuotesMatching(
	groupId: string,
	search: QuoteSearch,
): Quote[] {
	const conditions = ["group_id = ?"];
	const values: Array<string | number> = [groupId];

	if (search.content) {
		conditions.push("text LIKE ? COLLATE NOCASE");
		values.push(`%${search.content}%`);
	}
	if (search.person) {
		const personSearch = search.person.toLocaleLowerCase();
		if (personSearch === "someone" || personSearch === "jemand") {
			conditions.push("(person LIKE ? COLLATE NOCASE OR person = '')");
			values.push(`%${search.person}%`);
		} else {
			conditions.push("person LIKE ? COLLATE NOCASE");
			values.push(`%${search.person}%`);
		}
	}
	return db
		.prepare(
			`SELECT id, text, person, created_at as createdAt, quoted_at as quotedAt
			 FROM quotes
			 WHERE ${conditions.join(" AND ")}
			 ORDER BY quoted_at DESC, created_at DESC`,
		)
		.all(...values) as Quote[];
}

export function addQuote(
	groupId: string,
	text: string,
	person: string,
	quotedAt: number,
): Quote {
	const id = nanoid(16);
	const createdAt = Date.now();
	db.prepare(
		"INSERT INTO quotes (id, group_id, text, person, created_at, quoted_at) VALUES (?, ?, ?, ?, ?, ?)",
	).run(id, groupId, text, person, createdAt, quotedAt);
	return { id, text, person, createdAt, quotedAt };
}

/** Distinct people who have been quoted in this group, most recently used first. */
export function listPeople(groupId: string): string[] {
	const rows = db
		.prepare(
			`SELECT person, MAX(quoted_at) as lastUsed
			 FROM quotes
			 WHERE group_id = ?
			   AND person <> ''
			 GROUP BY person COLLATE NOCASE
			 ORDER BY lastUsed DESC`,
		)
		.all(groupId);
	return (rows as Array<{ person: string }>).map((r) => r.person);
}
