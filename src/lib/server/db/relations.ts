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
	quotesTable: {
		reactions: r.many.quoteReactions({
			from: r.quotesTable.id,
			to: r.quoteReactions.quoteId,
		}),
		comments: r.many.quoteComments({
			from: r.quotesTable.id,
			to: r.quoteComments.quoteId,
		}),
	},
	quoteComments: {
		reactions: r.many.commentReactions({
			from: r.quoteComments.id,
			to: r.commentReactions.commentId,
		}),
	},
	quoteReactions: {
		user: r.one.user({
			from: r.quoteReactions.userId,
			to: r.user.id,
		}),
	},
}));

export const authRelations = defineRelationsPart(
	{
		user: schema.user,
		session: schema.session,
		account: schema.account,
		verification: schema.verification,
	},
	(r) => ({
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
	}),
);
