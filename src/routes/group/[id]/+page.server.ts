import {
	addMembersToGroup,
	listPeople,
	removeMembersFromGroup,
} from "#lib/server/groups.js";
import zodSchemas from "#lib/zod-schemas.js";
import type { PageServerLoad } from "./$types";
import { error, fail } from "@sveltejs/kit";
import { rateLimit } from "#lib/server/rate-limiting.js";
import { crud } from "#lib/server/db/crud.js";
import { parsePaginationParams, parseSearchParams } from "#lib/server/utils.js";
import { queryQuotesOfGroupWithPagination } from "#lib/server/queries/quotes.js";
import { userIsMemberOfGroup } from "#lib/server/queries/users.js";

const QUOTES_DEFAULT_PAGE_SIZE = 30;

export const load: PageServerLoad = async ({ params, url, locals }) => {
	const groupId = params.id;

	const group = await crud().groups.findOne({
		id: groupId,
	});
	if (!group) error(404, "Group not found");

	const searchOptions = parseSearchParams(
		url.searchParams,
		zodSchemas.quotes.search,
	);

	const { page, perPage } = parsePaginationParams(url.searchParams);

	const [quotes, people, userIsMember] = await Promise.all([
		queryQuotesOfGroupWithPagination(
			groupId,
			page ?? 0,
			perPage ?? QUOTES_DEFAULT_PAGE_SIZE,
			searchOptions,
		),
		listPeople(groupId),
		locals.user ? userIsMemberOfGroup(locals.user?.id, groupId) : undefined,
	]);

	return {
		group,
		quotes,
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
