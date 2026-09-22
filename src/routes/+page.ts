import { browser } from "$app/environment";
import { groupsApi } from "$lib/client/api";
import { readStoredGroupIDs, setGroupIDs } from "$lib/client/storage";
import type { Group } from "$lib/types";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ data }) => {
	const groups: Set<Group> = new Set();

	if (data.groups) {
		for (const group of data.groups) groups.add(group);
	}

	if (browser) {
		const groupIDs = readStoredGroupIDs();
		const result = await groupsApi.getByIDs(groupIDs);

		if (result.ok) {
			for (const group of result.data) groups.add(group);
		}

		setGroupIDs(
			groups
				.values()
				.map((g) => g.id)
				.toArray(),
		);
	}

	return { groupCreationForm: data.groupCreationForm, groups: [...groups] };
};
