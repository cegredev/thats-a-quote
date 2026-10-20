import zodSchemas from "#lib/zod-schemas.js";
import type { PageServerLoad } from "./$types";
import { superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { error, fail } from "@sveltejs/kit";
import { rateLimit } from "#lib/server/rate-limiting.js";
import { crud } from "#lib/server/db/crud.js";
import { toDateTimeLocal } from "#lib/utils.js";

export const load: PageServerLoad = async ({ params }) => {
	const quoteId = params.id;
	if (!quoteId) error(400, "No quote id param");

	const quote = await crud().quotes.findOne({
		id: quoteId,
	});
	if (!quote) error(404, "no quote to id");

	const quoteEditForm = await superValidate(
		{
			...quote,
			quotedAt: toDateTimeLocal(new Date(quote.quotedAt)),
		},
		zod4(zodSchemas.quotes.create.update),
	);

	return {
		quoteEditForm,
	};
};

export const actions = {
	editQuote: rateLimit("medium", async ({ request, params }) => {
		const quoteId = params.id;
		if (!quoteId) error(400, "No quote id param");

		const form = await superValidate(
			request,
			zod4(zodSchemas.quotes.create.insert),
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
};
