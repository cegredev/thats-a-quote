import zodSchemas from "#lib/zod-schemas.js";
import type { PageServerLoad } from "./$types";
import { superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { error, fail } from "@sveltejs/kit";
import { rateLimit } from "#lib/server/rate-limiting.js";
import { crud } from "#lib/server/db/crud.js";
import { sendPush } from "#lib/server/push-vapid.js";
import { db } from "#lib/server/db.js";
import { groupMembers } from "#lib/server/db/schema.js";
import { eq } from "drizzle-orm";

export const load: PageServerLoad = async ({ params, url, locals }) => {
	const quoteCreationForm = await superValidate(
		zod4(zodSchemas.quotes.create.insert),
	);

	return {
		quoteCreationForm,
	};
};

export const actions = {
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

		return { form, id: quote.id };
	}),
};
