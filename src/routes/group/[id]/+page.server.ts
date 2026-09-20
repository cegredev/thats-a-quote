import {
	getGroupDetails,
	listPeople,
	removeMembersFromGroup,
} from "$lib/server/groups";
import zodSchemas from "$lib/zod-schemas";
import type { PageServerLoad } from "./$types";
import { superValidate } from "sveltekit-superforms";
import { zod, zod4 } from "sveltekit-superforms/adapters";
import { fail } from "@sveltejs/kit";
import { listQuotesMatching, addQuote } from "$lib/server/quotes";

export const load: PageServerLoad = async ({ params, url }) => {
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

	return {
		group,
		quotes,
		people,
		quoteCreationForm,
	};
};

export const actions = {
	createQuote: async ({ request, params }) => {
		const groupId = params.id;

		const form = await superValidate(
			request,
			zod4(zodSchemas.quotes.create),
		);

		if (!form.valid) {
			return fail(400, { form });
		}

		const id = await addQuote(
			groupId,
			form.data.text,
			form.data.person ?? "someone",
			new Date(form.data.quotedAt).getTime(),
		);

		return { form, id };
	},
	leaveGroup: async ({ params, locals }) => {
		const groupId = params.id;
		const userId = locals.user?.id;

		if (!userId) {
			return fail(401, "No user logged in");
		}

		await removeMembersFromGroup([{ groupId, userId }]);

		return {};
	},
};
