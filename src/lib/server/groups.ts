import { db } from "./db";
import { groupMembers, quotesTable } from "./db/schema";
import { and, desc, eq, isNotNull, sql } from "drizzle-orm";

/** Distinct people who have been quoted in this group, most recently used first. */
export async function listPeople(groupId: string): Promise<string[]> {
	const result = await db
		.select({
			person: quotesTable.person,
			lastUsed: sql<number>`MAX(${quotesTable.quotedAt})`,
		})
		.from(quotesTable)
		.where(
			and(
				eq(quotesTable.groupId, groupId),
				isNotNull(quotesTable.person),
			),
		)
		.groupBy(quotesTable.person)
		.orderBy(({ lastUsed }) => desc(lastUsed))
		.all();

	return result.map((r) => r.person!);
}

export async function addMembersToGroup(
	members: { groupId: string; userId: string }[],
): Promise<void> {
	await db.insert(groupMembers).values(members);
}

export async function removeMembersFromGroup(
	members: { groupId: string; userId: string }[],
): Promise<void> {
	await db
		.delete(groupMembers)
		.where(
			and(
				...members.map((m) =>
					and(
						eq(groupMembers.groupId, m.groupId),
						eq(groupMembers.userId, m.userId),
					),
				),
			),
		);
}

export async function getUserGroupMemberships(userId: string) {
	const memberships = await db.query.groupMembers.findMany({
		columns: {
			groupId: true,
			role: true,
		},
		where: {
			userId,
		},
	});
	return memberships;
}
