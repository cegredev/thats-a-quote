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
import { listQuotesMatching, addQuote } from "$lib/server/quotes";
import { rateLimit } from "$lib/server/rate-limiting";

export const load: PageServerLoad = async ({ params, url, locals }) => {
	const groupId = params.id;

	const groupDetails = await getGroupDetails([groupId]);
	if (groupDetails.length === 0)
		throw fail(404, { message: "Group not found" });
	const group = groupDetails[0];

	const searchRaw = Object.fromEntries(url.searchParams.entries());
	const result = zodSchemas.quotes.search.safeParse(searchRaw);
	const searchOptions = result.success ? result.data : {};

	const quotes = await listQuotesMatching(groupId, searchOptions);

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
		quotes,
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

		const id = await addQuote(groupId, {
			text: form.data.text,
			person: form.data.person,
			quotedAt: new Date(form.data.quotedAt).getTime(),
			context: form.data.context,
		});

		return { form, id };
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
