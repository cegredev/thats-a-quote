import { migrateStorage } from "$lib/client/storage";
import type { LayoutLoad } from "./$types";

export const ssr = false;

export const load: LayoutLoad = async () => {
	migrateStorage();
};
