import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { groupsTable, quotesTable } from "./db/schema";
import { and, desc, eq, like, ne, SQL, sql } from "drizzle-orm";

export type GroupRow = {
	id: string;
	name: string;
	passwordHash: string | null;
	createdAt: number;
};
export type Quote = {
	id: string;
	text: string;
	person: string;
	createdAt: number;
	quotedAt: number;
};

/** Create a new group and return its long unique id. */
export async function createGroup(
	name: string,
	password: string | null,
	customId?: string,
): Promise<string> {
	const id = customId || nanoid(24);
	const passwordHash = password ? bcrypt.hashSync(password, 10) : null;

	await db
		.insert(groupsTable)
		.values({ id, name, passwordHash, createdAt: Date.now() });

	return id;
}

export async function getGroup(id: string): Promise<GroupRow | undefined> {
	const result = await db
		.select()
		.from(groupsTable)
		.where(eq(groupsTable.id, id));

	if (result.length !== 1) return undefined;

	return {
		id: result[0].id,
		name: result[0].name,
		passwordHash: result[0].passwordHash,
		createdAt: result[0].createdAt,
	};
}

export function groupHasPassword(group: GroupRow): boolean {
	return Boolean(group.passwordHash);
}

export function checkGroupPassword(group: GroupRow, password: string): boolean {
	if (!group.passwordHash) return true;
	if (!password) return false;
	return bcrypt.compareSync(password, group.passwordHash);
}

export async function listQuotes(groupId: string): Promise<Quote[]> {
	return listQuotesMatching(groupId, {});
}

export type QuoteSearch = {
	content?: string;
	person?: string;
};

export async function listQuotesMatching(
	groupId: string,
	search: QuoteSearch,
): Promise<Quote[]> {
	const conditions: SQL[] = [];

	conditions.push(eq(quotesTable.groupId, groupId));

	if (search.content) {
		conditions.push(like(quotesTable.text, `%${search.content}%`));
	}

	if (search.person) {
		conditions.push(like(quotesTable.person, search.person));
	}

	const result = await db
		.select()
		.from(quotesTable)
		.where(and(...conditions))
		.orderBy(desc(quotesTable.quotedAt), desc(quotesTable.createdAt))
		.all();

	return result as Quote[];
}

export async function addQuote(
	groupId: string,
	text: string,
	person: string,
	quotedAt: number,
): Promise<Quote> {
	const id = nanoid(16);
	const createdAt = Date.now();

	await db
		.insert(quotesTable)
		.values({ id, groupId, text, person, createdAt, quotedAt });

	return { id, text, person, createdAt, quotedAt };
}

/** Distinct people who have been quoted in this group, most recently used first. */
export async function listPeople(groupId: string): Promise<string[]> {
	const result = await db
		.select({
			person: quotesTable.person,
			lastUsed: sql<number>`MAX(${quotesTable.quotedAt})`,
		})
		.from(quotesTable)
		.where(
			and(eq(quotesTable.groupId, groupId), ne(quotesTable.person, "")),
		)
		.groupBy(quotesTable.person)
		.orderBy(({ lastUsed }) => desc(lastUsed))
		.all();

	return result.map((r) => r.person);
}
