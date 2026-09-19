import { and, desc, eq, like, type SQL } from "drizzle-orm";
import { quotesTable } from "./db/schema";
import { db } from "./db";
import { nanoid } from "nanoid";

export type Quote = {
	id: string;
	text: string;
	person: string;
	createdAt: number;
	quotedAt: number;
};

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
		conditions.push(like(quotesTable.person, `%${search.person}%`));
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
