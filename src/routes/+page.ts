import { browser } from "$app/environment";
import { groupsApi } from "$lib/api";
import { readStoredGroupIDs, type Group } from "$lib/storage";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ data }) => {
	const groups: Group[] = [];

	if (data.groups) {
		groups.push(...data.groups);
	}

	if (browser) {
		const groupIDs = readStoredGroupIDs();
		const result = await groupsApi.getByIDs(groupIDs);

		if (result.ok) {
			groups.push(...result.data);
		}
	}

	return { groupCreationForm: data.groupCreationForm, groups };
};
