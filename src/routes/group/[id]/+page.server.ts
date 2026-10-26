import {
	addMembersToGroup,
	listPeople,
	removeMembersFromGroup,
} from "#lib/server/queries/groups.js";
import zodSchemas from "#lib/zod-schemas.js";
import type { PageServerLoad } from "./$types";
import { error, fail, redirect } from "@sveltejs/kit";
import { rateLimit } from "#lib/server/rate-limiting.js";
import { crud } from "#lib/server/db/crud.js";
import { parsePaginationParams, parseSearchParams } from "#lib/server/utils.js";
import { queryQuotesOfGroupWithPagination } from "#lib/server/queries/quotes.js";
import { userIsMemberOfGroup } from "#lib/server/queries/users.js";
import { superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { groupMembers } from "#lib/server/db/schema.ts";
import { eq } from "drizzle-orm";
import { sendPush } from "#lib/server/push-vapid.js";
import { db } from "#lib/server/db.ts";
import { toDateTimeLocal } from "#lib/utils.js";
import type { SuperValidated } from "sveltekit-superforms";
import type z from "zod";

const QUOTES_DEFAULT_PAGE_SIZE = 50;

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
			page ?? 1,
			perPage ?? QUOTES_DEFAULT_PAGE_SIZE,
			searchOptions,
		),
		listPeople(groupId),
		locals.user ? userIsMemberOfGroup(locals.user?.id, groupId) : undefined,
	]);

	const quoteCreationForm = await superValidate(
		zod4(zodSchemas.quotes.create.insert),
	);

	let quoteEditForm:
		| SuperValidated<z.infer<typeof zodSchemas.quotes.create.update>>
		| undefined;
	const quoteIdToEdit = url.searchParams.get("edit");
	if (quoteIdToEdit) {
		const quote = await crud().quotes.findOne({ id: quoteIdToEdit });
		if (!quote || quote.groupId !== groupId) error(404, "Quote not found");

		quoteEditForm = await superValidate(
			{
				...quote,
				quotedAt: toDateTimeLocal(new Date(quote.quotedAt)),
			},
			zod4(zodSchemas.quotes.create.update),
		);
	}

	let groupEditForm:
		| SuperValidated<z.infer<typeof zodSchemas.groups.create.update>>
		| undefined;
	const shouldEdit = url.searchParams.get("editGroup");
	if (shouldEdit !== "" && shouldEdit !== null) {
		groupEditForm = await superValidate(
			{
				...group,
			},
			zod4(zodSchemas.groups.create.update),
		);
	}

	return {
		group,
		quotes,
		people,
		userIsMember,
		quoteCreationForm,
		quoteEditForm,
		groupEditForm,
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
	reactToQuote: rateLimit("medium", async ({ request, locals, params }) => {
		const form = await superValidate(
			request,
			zod4(zodSchemas.quoteReactions.create),
		);

		if (!form.valid) return fail(400, { form });

		const quoteId = form.data.quoteId;
		if (
			!(await crud().quotes.findOne({
				id: quoteId,
			}))
		)
			error(404, "No quote found for id");

		if (!locals.user) error(401, "not signed in");

		const existingReaction = await crud().quoteReactions.findOne({
			quoteId,
			userId: locals.user.id,
		});

		if (existingReaction) {
			await crud().quoteReactions.permanentDelete(existingReaction.id);
		}

		if (!existingReaction || existingReaction.content !== form.data.content)
			await crud().quoteReactions.create({
				content: form.data.content,
				quoteId,
				userId: locals.user.id,
			});

		return {};
	}),
	createQuote: rateLimit("medium", async ({ request, params }) => {
		const groupId = params.id;
		if (!groupId) error(400, "No group id param");

		const group = await crud().groups.findOne({
			id: groupId,
		});
		if (!group) error(400, "group does not exist");

		const form = await superValidate(
			request,
			zod4(zodSchemas.quotes.create.insert),
		);

		if (!form.valid) return fail(400, { form });

		const quote = await crud().quotes.create(
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

		const members = await db()
			.select()
			.from(groupMembers)
			.where(eq(groupMembers.groupId, groupId));
		await sendPush(
			members.map((m) => m.userId),
			{
				title: `Quote added in ${group.name}`,
				message: quote.text,
			},
		);

		return { form };
	}),
	editQuote: rateLimit("medium", async ({ request, params, url }) => {
		const groupId = params.id;
		if (!groupId) error(400, "No group id param");

		const quoteId = url.searchParams.get("edit");
		if (!quoteId) error(400, "No quote id param");

		const quote = await crud().quotes.findOne({ id: quoteId });
		if (!quote || quote.groupId !== groupId) error(404, "Quote not found");

		const form = await superValidate(
			request,
			zod4(zodSchemas.quotes.create.update),
		);

		if (!form.valid) return fail(400, { form });

		await crud().quotes.update(quoteId, {
			text: form.data.text,
			person: form.data.person,
			quotedAt: new Date(form.data.quotedAt).getTime(),
			context: form.data.context,
		});

		return { form };
	}),
	editGroup: rateLimit("medium", async ({ request, params }) => {
		const groupId = params.id;
		if (!groupId) error(400, "No group id param");

		const form = await superValidate(
			request,
			zod4(zodSchemas.groups.create.update),
		);

		if (!form.valid) return fail(400, { form });

		await crud().groups.update(groupId, {
			...form.data,
		});

		return { form };
	}),
};
