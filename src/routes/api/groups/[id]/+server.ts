import { json, error } from '@sveltejs/kit';
import {
	getGroup,
	groupHasPassword,
	checkGroupPassword,
	listQuotes,
	listPeople
} from '$lib/server/groups';

export async function GET({ params, url }) {
	const group = getGroup(params.id);
	if (!group) throw error(404, 'This group does not exist.');

	const password = url.searchParams.get('password') || '';
	const hasPassword = groupHasPassword(group);

	if (hasPassword && !checkGroupPassword(group, password)) {
		return json({ name: group.name, hasPassword: true, authorized: false }, { status: 401 });
	}

	return json({
		name: group.name,
		hasPassword,
		authorized: true,
		quotes: listQuotes(group.id),
		people: listPeople(group.id)
	});
}
