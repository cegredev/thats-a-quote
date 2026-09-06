import { index, int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const groupsTable = sqliteTable("groups", {
	id: text()
		.primaryKey()
		.$default(() => crypto.randomUUID()),
	name: text().notNull(),
	passwordHash: text(),
	createdAt: int().notNull(),
});

export const quotesTable = sqliteTable(
	"quotes",
	{
		id: text()
			.primaryKey()
			.$default(() => crypto.randomUUID()),
		groupId: text()
			.notNull()
			.references(() => groupsTable.id, { onDelete: "cascade" }),
		text: text().notNull(),
		person: text().notNull(),
		createdAt: int().notNull(),
		quotedAt: int().notNull().default(0),
	},
	(table) => [index("idx_quotes_group").on(table.groupId)],
);
export const accountsTable = sqliteTable("accounts", {
	id: text()
		.primaryKey()
		.$default(() => crypto.randomUUID()),
	username: text().notNull().unique(),
	passwordHash: text().notNull(),
	vault: text().notNull().default("[]"),
	updatedAt: int().notNull(),
});
