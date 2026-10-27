import {
	check,
	index,
	int,
	integer,
	sqliteTable,
	text,
	unique,
	uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import { nanoid } from "nanoid";

export const groupsTable = sqliteTable("groups", {
	id: text()
		.primaryKey()
		.$default(() => nanoid()),
	name: text().notNull(),
	createdAt: int({ mode: "timestamp_ms" })
		.notNull()
		.$default(() => new Date()),
});

export const quotesTable = sqliteTable(
	"quotes",
	{
		id: text()
			.primaryKey()
			.$default(() => uuidv7()),
		groupId: text()
			.notNull()
			.references(() => groupsTable.id, { onDelete: "cascade" }),
		text: text().notNull(),
		person: text(),
		context: text(),
		createdAt: int({ mode: "timestamp_ms" })
			.notNull()
			.$default(() => new Date()),
		quotedAt: int({ mode: "timestamp_ms" }).notNull(),
	},
	(table) => [index("idx_quotes_group").on(table.groupId)],
);

export const quoteComments = sqliteTable(
	"quote_comments",
	{
		id: text("id")
			.primaryKey()
			.$default(() => uuidv7()),
		quoteId: text("quote_id")
			.notNull()
			.references(() => quotesTable.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		content: text("content").notNull(),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.notNull()
			.$defaultFn(() => new Date()),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.notNull()
			.$defaultFn(() => new Date()),
	},
	(t) => [
		index("comments_quote_id_idx").on(t.quoteId),
		index("comments_user_id_idx").on(t.userId),
	],
);

export const quoteReactions = sqliteTable(
	"quote_reactions",
	{
		id: text("id")
			.primaryKey()
			.$default(() => uuidv7()),
		quoteId: text("quote_id")
			.notNull()
			.references(() => quotesTable.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		content: text("content").notNull(),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.notNull()
			.$defaultFn(() => new Date()),
	},
	(t) => [
		uniqueIndex("quote_reactions_user_quote_uq").on(t.userId, t.quoteId),
		index("quote_reactions_quote_id_idx").on(t.quoteId),
	],
);

export const commentReactions = sqliteTable(
	"comment_reactions",
	{
		id: text("id")
			.primaryKey()
			.$default(() => uuidv7()),
		commentId: text("comment_id")
			.notNull()
			.references(() => quoteComments.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		content: text("content").notNull(),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.notNull()
			.$defaultFn(() => new Date()),
	},
	(t) => [
		uniqueIndex("comment_reactions_user_comment_uq").on(
			t.userId,
			t.commentId,
		),
		index("comment_reactions_comment_id_idx").on(t.commentId),
	],
);

export const groupMembers = sqliteTable(
	"group_members",
	{
		groupId: text()
			.notNull()
			.references(() => groupsTable.id, { onDelete: "cascade" }),
		userId: text()
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		role: text("role", { enum: ["admin", "moderator", "member"] })
			.notNull()
			.default("member"),
	},
	(table) => [
		unique("group_members_unique").on(table.groupId, table.userId),
		check(
			"group_members_role_check",
			sql`${table.role} IN ('admin', 'moderator', 'member')`,
		),
	],
);

export const pushSubscriptions = sqliteTable("push_subscriptions", {
	endpoint: text().primaryKey(),
	p256dh: text().notNull(),
	auth: text().notNull(),
	userId: text().references(() => user.id, { onDelete: "set null" }),
});

export const user = sqliteTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: integer("email_verified", { mode: "boolean" })
		.default(false)
		.notNull(),
	image: text("image"),
	createdAt: integer("created_at", { mode: "timestamp_ms" })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp_ms" })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const session = sqliteTable(
	"session",
	{
		id: text("id").primaryKey(),
		expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
		token: text("token").notNull().unique(),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
		ipAddress: text("ip_address"),
		userAgent: text("user_agent"),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
	},
	(table) => [index("session_userId_idx").on(table.userId)],
);

export const account = sqliteTable(
	"account",
	{
		id: text("id").primaryKey(),
		accountId: text("account_id").notNull(),
		providerId: text("provider_id").notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		accessToken: text("access_token"),
		refreshToken: text("refresh_token"),
		idToken: text("id_token"),
		accessTokenExpiresAt: integer("access_token_expires_at", {
			mode: "timestamp_ms",
		}),
		refreshTokenExpiresAt: integer("refresh_token_expires_at", {
			mode: "timestamp_ms",
		}),
		scope: text("scope"),
		password: text("password"),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = sqliteTable(
	"verification",
	{
		id: text("id").primaryKey(),
		identifier: text("identifier").notNull(),
		value: text("value").notNull(),
		expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [index("verification_identifier_idx").on(table.identifier)],
);
