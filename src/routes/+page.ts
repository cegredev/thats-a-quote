import { browser } from "$app/environment";
import { groupsApi } from "$lib/client/api";
import { readStoredGroupIDs, setGroupIDs } from "$lib/client/storage";
import { type GroupID, type Group } from "$lib/types";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ data }) => {
	let groups: Group[] = [];

	if (data.groups) {
		groups.push(...data.groups);
	}

	if (browser) {
		const groupIDs = readStoredGroupIDs();
		const result = await groupsApi.getByIDs(groupIDs);

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

		setGroupIDs(ids.values().toArray());
	}

	return { groupCreationForm: data.groupCreationForm, groups: [...groups] };
};
