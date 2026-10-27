import {
	DRAWER_QUERY_PARAM,
	type DrawerKey,
	type DrawerParams,
} from "#lib/drawers-shared.ts";
import { goto } from "$app/navigation";
import { page } from "$app/state";

export const drawerIsActive = (drawer: DrawerKey): boolean =>
	page.url.searchParams.get(DRAWER_QUERY_PARAM) === drawer;

export const gotoDrawer = async (
	drawer: DrawerKey,
	drawerArgs: DrawerParams[DrawerKey] = {},
): Promise<void> => {
	const additionalArgs: [string, string][] = [];
	if (drawerArgs !== undefined) {
		Object.entries(drawerArgs).forEach((arr) => additionalArgs.push(arr));
	}

	const href = addQueryParamsToHref([
		[DRAWER_QUERY_PARAM, drawer],
		...additionalArgs,
	]);

	await goto(href, {
		reset: false,
	});
};

export const removeDrawerNavigationHistory = (drawer: DrawerKey): void => {
	if (page.url.searchParams.get(DRAWER_QUERY_PARAM) === drawer) {
		window.history.back();
	}
};

const addQueryParamsToHref = (params: [string, string][]) => {
	const url = new URL(page.url.href);
	for (const [param, value] of params) url.searchParams.set(param, value);
	return `${url.pathname}${url.search}`;
};
