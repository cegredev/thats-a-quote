import { browser } from "$app/env";
import { groupsApi } from "#lib/client/api.js";
import { type GroupID, type Group } from "#lib/types.js";
import type { PageLoad } from "./$types";
import { groupIDsStore } from "#lib/client/storage.svelte.js";
import { DUMMY_DATA_INTERVAL_SECONDS } from "$app/env/public";

export const load: PageLoad = async ({ data, fetch }) => {
	let groups: Group[] = [];

	if (data.groups) {
		groups.push(...data.groups);
	}

	if (browser) {
		const storedIds = groupIDsStore.ids;

		if (DUMMY_DATA_INTERVAL_SECONDS !== undefined) {
			storedIds.push(...["demo-group-1", "demo-group-2"]);
		}

		const result = await groupsApi(fetch).getByIDs(storedIds);

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
