import { defineRelations, defineRelationsPart } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
	groupsTable: {
		members: r.many.user({
			from: r.groupsTable.id,
			to: r.user.id,
		}),
	},
	user: {
		groups: r.many.groupsTable({
			from: r.user.id,
			to: r.groupsTable.id,
		}),
	},
}));

export const authRelations = defineRelationsPart(schema, (r) => ({
	user: {
		sessions: r.many.session({
			from: r.user.id,
			to: r.session.userId,
		}),
		accounts: r.many.account({
			from: r.user.id,
			to: r.account.userId,
		}),
	},
	session: {
		user: r.one.user({
			from: r.session.userId,
			to: r.user.id,
		}),
	},
	account: {
		user: r.one.user({
			from: r.account.userId,
			to: r.user.id,
		}),
	},
}));
