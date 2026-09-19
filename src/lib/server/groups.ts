import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { groupMembers, groupsTable, quotesTable } from "./db/schema";
import { and, desc, eq, inArray, like, ne, SQL, sql } from "drizzle-orm";

export type GroupRow = {
	id: string;
	name: string;
	createdAt: number;
};

/** Create a new group and return its long unique id. */
export async function createGroup(
	name: string,
	customId?: string,
): Promise<string> {
	const id = customId || nanoid(24);

	await db.insert(groupsTable).values({ id, name, createdAt: Date.now() });

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
		createdAt: result[0].createdAt,
	};
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

export async function getGroupDetails(groupIds: string[]) {
	const groups = await db
		.select()
		.from(groupsTable)
		.where(inArray(groupsTable.id, groupIds));
	return groups;
}
