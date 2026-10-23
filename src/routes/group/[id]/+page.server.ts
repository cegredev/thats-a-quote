import {
	addMembersToGroup,
	getUserGroupMemberships,
	listPeople,
	removeMembersFromGroup,
} from "#lib/server/groups.js";
import zodSchemas from "#lib/zod-schemas.js";
import type { PageServerLoad } from "./$types";
import { error, fail } from "@sveltejs/kit";
import { rateLimit } from "#lib/server/rate-limiting.js";
import { crud } from "#lib/server/db/crud.js";
import { parsePaginationParams, parseSearchParams } from "#lib/server/utils.js";
import { db } from "#lib/server/db.js";
import { quoteReactions } from "#lib/server/db/schema.js";
import { count, inArray } from "drizzle-orm";

const QUOTES_DEFAULT_PAGE_SIZE = 30;

export const load: PageServerLoad = async ({ params, url, locals }) => {
	const groupId = params.id;

	const groupDetails = await crud().groups.findOne({
		id: groupId,
	});
	if (!groupDetails) error(404, "Group not found");

	const searchOptions = parseSearchParams(
		url.searchParams,
		zodSchemas.quotes.search,
	);

	const { page, perPage } = parsePaginationParams(url.searchParams);
	const limit = perPage ?? QUOTES_DEFAULT_PAGE_SIZE;

	// const quotes = await db().query.quotesTable.findMany({
	// 	where: {
	// 		groupId,
	// 	},
	// 	limit,
	// 	offset: (page ?? 0) * limit,
	// 	with: {
	// 		reactions: {
	// 			columns: {
	// 				content: true,
	// 			},
	// 		},
	// 	},
	// 	orderBy: {
	// 		quotedAt: "desc",
	// 		createdAt: "desc",
	// 	},
	// });

	const quotesPagination = await crud().quotes.list({
		filters: {
			groupId,
			person: searchOptions.person
				? {
						like: `%${searchOptions.person}%`,
					}
				: undefined,
			text: searchOptions.text
				? {
						like: `%${searchOptions.text}%`,
					}
				: undefined,
		},
		orderBy: [
			{ field: "quotedAt", direction: "desc" },
			{ field: "createdAt", direction: "desc" },
		],
		page: page,
		perPage: perPage ?? QUOTES_DEFAULT_PAGE_SIZE,
	});

	const reactions = await db()
		.select({
			quoteId: quoteReactions.quoteId,
			content: quoteReactions.content,
			count: count(quoteReactions.content),
		})
		.from(quoteReactions)
		.groupBy(quoteReactions.quoteId, quoteReactions.content)
		.where(
			inArray(
				quoteReactions.quoteId,
				quotesPagination.results.map((q) => q.id),
			),
		);

	const reactionsMap = reactions.reduce(
		(previous, current) => {
			const array = (previous[current.quoteId] ??= []);

			const fields = array.filter((r) => r.content === current.content);
			if (fields.length === 1) fields[0].count++;
			else array.push({ content: current.content, count: 1 });

			return previous;
		},
		{} as Record<string, { content: string; count: number }[]>,
	);

	const people = await listPeople(groupId);

	let userIsMember: boolean | undefined = undefined;
	if (locals.user) {
		const memberships = await getUserGroupMemberships(locals.user.id);

		userIsMember = memberships.some((m) => m.groupId === groupId);
	}

	return {
		group: groupDetails,
		quotesPagination,
		reactionsMap,
		people,
		userIsMember,
	};
};

export const actions = {
	joinGroup: rateLimit("medium", async ({ params, locals }) => {
		const groupId = params.id;
		if (!groupId) error(400, "No group id param");

		const userId = locals.user?.id;

		if (!userId) return fail(401, "No user logged in");

		await addMembersToGroup([{ groupId, userId }]);

		return {};
	}),
	leaveGroup: rateLimit("medium", async ({ params, locals }) => {
		const groupId = params.id;
		if (!groupId) error(400, "No group id param");

		const userId = locals.user?.id;

		if (!userId) return fail(401, "No user logged in");

		await removeMembersFromGroup([{ groupId, userId }]);

		return {};
	}),
};
