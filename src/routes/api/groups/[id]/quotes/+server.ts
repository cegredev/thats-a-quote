import { json, error } from "@sveltejs/kit";
import {
	getGroup,
	checkGroupPassword,
	addQuote,
	listQuotes,
	listPeople,
} from "$lib/server/groups";

export async function POST({ params, request }) {
	const group = getGroup(params.id);
	if (!group) throw error(404, "This group does not exist.");

	const body = await request.json().catch(() => ({}));
	if (!checkGroupPassword(group, body.password)) {
		throw error(401, "Incorrect password.");
	}

	const text = (body.text || "").trim();
	const person = typeof body.person === "string" ? body.person.trim() : "";
	const requestedQuotedAt =
		typeof body.quotedAt === "number" ? body.quotedAt : Date.now();
	const quotedAt = Math.floor(requestedQuotedAt / 1000) * 1000;

	if (!text) throw error(400, "The quote cannot be empty.");
	if (text.length > 1000) throw error(400, "That quote is too long.");
	if (person.length > 80)
		throw error(400, "Name must be under 80 characters.");
	if (!Number.isSafeInteger(requestedQuotedAt) || requestedQuotedAt < 0)
		throw error(400, "The quote date is invalid.");

	addQuote(group.id, text, person, quotedAt);

	return json({
		quotes: listQuotes(group.id),
		people: listPeople(group.id),
	});
}
