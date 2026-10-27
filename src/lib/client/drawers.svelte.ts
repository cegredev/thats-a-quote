import {
	DRAWER_QUERY_PARAM,
	type DrawerKey,
	type DrawerParams,
} from "#lib/drawers-shared.ts";
import { page } from "$app/state";

export const drawerIsActive = (drawer: DrawerKey): boolean =>
	page.url.searchParams.get(DRAWER_QUERY_PARAM) === drawer;

export const drawerHref = (
	drawer: DrawerKey,
	drawerArgs: DrawerParams[DrawerKey] = {},
): string => {
	const additionalArgs: [string, string][] = [];
	if (drawerArgs !== undefined) {
		Object.entries(drawerArgs).forEach((arr) => additionalArgs.push(arr));
	}

	return addQueryParamsToHref([
		[DRAWER_QUERY_PARAM, drawer],
		...additionalArgs,
	]);
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
