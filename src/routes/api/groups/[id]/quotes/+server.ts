import { json, error } from '@sveltejs/kit';
import { getGroup, checkGroupPassword, addQuote, listQuotes, listPeople } from '$lib/server/groups';

export async function POST({ params, request }) {
	const group = getGroup(params.id);
	if (!group) throw error(404, 'This group does not exist.');

	const body = await request.json().catch(() => ({}));
	if (!checkGroupPassword(group, body.password)) {
		throw error(401, 'Incorrect password.');
	}

	const text = (body.text || '').trim();
	const person = (body.person || '').trim();

	if (!text) throw error(400, 'The quote cannot be empty.');
	if (text.length > 1000) throw error(400, 'That quote is too long.');
	if (!person) throw error(400, 'Who said it?');
	if (person.length > 80) throw error(400, 'Name must be under 80 characters.');

	addQuote(group.id, text, person);

	return json({
		quotes: listQuotes(group.id),
		people: listPeople(group.id)
	});
}
