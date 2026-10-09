import { browser } from "$app/env";
import { groupsApi } from "#lib/client/api.js";
import { type GroupID, type Group } from "#lib/types.js";
import type { PageLoad } from "./$types";
import { groupIDsStore } from "#lib/client/storage.svelte.js";

export const load: PageLoad = async ({ data, fetch }) => {
	let groups: Group[] = [];

	if (data.groups) {
		groups.push(...data.groups);
	}

	if (browser) {
		const result = await groupsApi(fetch).getByIDs(groupIDsStore.ids);

		if (result.ok) {
			groups.push(...result.data);
		}

		const uniqueGroups: Group[] = [];
		const ids = new Set<GroupID>();
		for (const group of groups) {
			if (!ids.has(group.id)) {
				uniqueGroups.push(group);
			}

			ids.add(group.id);
		}

		groups = uniqueGroups;

		groupIDsStore.set(ids.values().toArray());
	}

	return { groupCreationForm: data.groupCreationForm, groups: [...groups] };
};
