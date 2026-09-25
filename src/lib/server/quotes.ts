import { and, desc, eq, like, type SQL } from "drizzle-orm";
import { quotesTable } from "./db/schema";
import { db } from "./db";
import { v7 as uuidv7 } from "uuid";

export type Quote = {
	id: string;
	createdAt: number;
	text: string;
	person?: string;
	context?: string;
	quotedAt: number;
};

export type QuoteSearch = {
	text?: string;
	person?: string;
};

export async function listQuotesMatching(
	groupId: string,
	search: QuoteSearch,
): Promise<Quote[]> {
	const conditions: SQL[] = [];

	conditions.push(eq(quotesTable.groupId, groupId));

	if (search.text) {
		conditions.push(like(quotesTable.text, `%${search.text}%`));
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
	quote: Omit<Quote, "id" | "createdAt">,
): Promise<string> {
	// UUID v7 should be used for most database primary keys
	// (https://createuuid.com/articles/uuid-versions-explained)
	const id = uuidv7();

	await db.insert(quotesTable).values({ id, groupId, ...quote });

	return id;
}
