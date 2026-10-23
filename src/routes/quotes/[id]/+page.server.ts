import type { PageServerLoad } from "./$types";
import { error, fail } from "@sveltejs/kit";
import { crud } from "#lib/server/db/crud.js";
import { rateLimit } from "#lib/server/rate-limiting.ts";
import zodSchemas from "#lib/zod-schemas.js";
import { zod4 } from "sveltekit-superforms/adapters";
import { superValidate } from "sveltekit-superforms";
import { db } from "#lib/server/db.js";

export const load: PageServerLoad = async ({ params, url, locals }) => {
	const quoteId = params.id;

	const quote = await db().query.quotesTable.findFirst({
		where: {
			id: quoteId,
		},
		with: {
			comments: true,
			reactions: true,
		},
	});
	if (!quote) error(404, "Quote not found");

	return {
		quote,
	};
};

export const actions = {
	reactToQuote: rateLimit("medium", async ({ request, locals, params }) => {
		const form = await superValidate(
			request,
			zod4(zodSchemas.quoteReactions.create),
		);

		if (!form.valid) return fail(400, { form });

		const quoteId = params.id ?? error(400, "No quote id param");
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

		// let reaction:
		// 	| z.infer<typeof zodSchemas.quoteReactions.select>
		// 	| undefined = undefined;
		if (!existingReaction || existingReaction.content !== form.data.content)
			await crud().quoteReactions.create({
				content: form.data.content,
				quoteId,
				userId: locals.user.id,
			});

		return { form };
	}),
};
