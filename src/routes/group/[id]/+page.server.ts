import {
	addMembersToGroup,
	getGroupDetails,
	getUserGroupMemberships,
	listPeople,
	removeMembersFromGroup,
} from "$lib/server/groups";
import zodSchemas from "$lib/zod-schemas";
import type { PageServerLoad } from "./$types";
import { superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { error, fail } from "@sveltejs/kit";
import { rateLimit } from "$lib/server/rate-limiting";
import { quotesCrud } from "$lib/server/db/crud";

export const load: PageServerLoad = async ({ params, url, locals }) => {
	const groupId = params.id;

	const groupDetails = await getGroupDetails([groupId]);
	if (groupDetails.length === 0)
		throw fail(404, { message: "Group not found" });
	const group = groupDetails[0];

	const searchRaw = Object.fromEntries(url.searchParams.entries());
	const result = zodSchemas.quotes.search.safeParse(searchRaw);
	const searchOptions = result.success ? result.data : {};

	const quotesPagination = await quotesCrud.list({
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
			{
				field: "quotedAt",
				direction: "desc",
			},

			{
				field: "createdAt",
				direction: "desc",
			},
		],
	});

	const people = await listPeople(groupId);

	const quoteCreationForm = await superValidate(
		zod4(zodSchemas.quotes.create),
	);

	let userIsMember: boolean | undefined = undefined;
	if (locals.user) {
		const memberships = await getUserGroupMemberships(locals.user.id);

		userIsMember = memberships.some((m) => m.groupId === groupId);
	}

	return {
		group,
		quotesPagination,
		people,
		quoteCreationForm,
		userIsMember,
	};
};

export const actions = {
	createQuote: rateLimit("medium", async ({ request, params }) => {
		const groupId = params.id;
		if (!groupId)
			error(400, {
				message: "No group id param",
			});

		const form = await superValidate(
			request,
			zod4(zodSchemas.quotes.create),
		);

		if (!form.valid) {
			return fail(400, { form });
		}

		const quote = await quotesCrud.create(
			{
				groupId,
				text: form.data.text,
				person: form.data.person,
				quotedAt: new Date(form.data.quotedAt).getTime(),
				context: form.data.context,
			},
			{
				skipValidation: true,
			},
		);

		return { form, id: quote.id };
	}),
	joinGroup: rateLimit("medium", async ({ params, locals }) => {
		const groupId = params.id;
		if (!groupId)
			error(400, {
				message: "No group id param",
			});

		const userId = locals.user?.id;

		if (!userId) {
			return fail(401, "No user logged in");
		}

		await addMembersToGroup([{ groupId, userId }]);

		return {};
	}),
	leaveGroup: rateLimit("medium", async ({ params, locals }) => {
		const groupId = params.id;
		if (!groupId)
			error(400, {
				message: "No group id param",
			});

		const userId = locals.user?.id;

		if (!userId) {
			return fail(401, "No user logged in");
		}

		await removeMembersFromGroup([{ groupId, userId }]);

		return {};
	}),
};
