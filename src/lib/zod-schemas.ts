import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { groupsTable, quotesTable } from "./server/db/schema";

const schemas = {
	groups: {
		create: {
			select: createSelectSchema(groupsTable),
			insert: createInsertSchema(groupsTable, {
				name: (schema) =>
					schema
						.min(1, { message: "Group name cannot be empty" })
						.max(100, {
							message: "Group name cannot exceed 100 characters",
						}),
			}).omit({ createdAt: true }),
			update: createUpdateSchema(groupsTable, {
				name: (schema) =>
					schema
						.min(1, { message: "Group name cannot be empty" })
						.max(100, {
							message: "Group name cannot exceed 100 characters",
						}),
			}).omit({ id: true, createdAt: true }),
		},
	},
	quotes: {
		create: {
			select: createSelectSchema(quotesTable),
			insert: createInsertSchema(quotesTable, {
				quotedAt: z.iso.datetime({ local: true }),
			}).omit({ id: true, createdAt: true }),
			update: createUpdateSchema(quotesTable, {
				quotedAt: z.iso.datetime({ local: true }),
			}).omit({ id: true, createdAt: true }),
		},
		search: z.object({
			text: z.string().optional(),
			person: z.string().optional(),
		}),
	},
	users: {
		register: z.object({
			name: z.string().min(1).max(128),
			email: z.email(),
			password: z.string().min(8).max(128),
		}),
		login: z.object({
			email: z.email(),
			password: z.string(),
		}),
	},
};

export default schemas;

export type Group = z.infer<typeof schemas.groups.create.select>;
export type GroupInsert = z.infer<typeof schemas.groups.create.insert>;
export type GroupUpdate = z.infer<typeof schemas.groups.create.update>;

export type Quote = z.infer<typeof schemas.quotes.create.select>;
export type QuoteInsert = z.infer<typeof schemas.quotes.create.insert>;
export type QuoteUpdate = z.infer<typeof schemas.quotes.create.update>;
