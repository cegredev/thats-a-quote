// The browser's local storage is the only "account" a user needs by default.
// It holds a list of the groups they've created or joined, each with the
// group's id, a cached name, and its password (if any) so they don't have
// to retype it every visit.

const GROUPS_KEY = "thats-a-quote:groups";

export type GroupID = string;
export type Group = { id: GroupID; name: string; password: string | null };

function hasStorage() {
	return (
		typeof window !== "undefined" &&
		typeof window.localStorage !== "undefined"
	);
}

function safeParse<T>(raw: string | null, fallback: T): T {
	if (!raw) return fallback;
	try {
		const parsed = JSON.parse(raw);
		return parsed ?? fallback;
	} catch {
		return fallback;
	}
}

/** @returns {{id: string, name: string, password: string|null}[]} */
export function readStoredGroupIDs(): GroupID[] {
	if (!hasStorage()) return [];
	return safeParse(window.localStorage.getItem(GROUPS_KEY), []);
}

function storeGroupIDs(groupIDs: GroupID[]): void {
	if (!hasStorage()) return;
	window.localStorage.setItem(GROUPS_KEY, JSON.stringify(groupIDs));
}

export function addStoredGroupID(groupID: GroupID): void {
	const groupIDs = readStoredGroupIDs();

	if (!groupIDs.includes(groupID)) {
		groupIDs.push(groupID);

		storeGroupIDs(groupIDs);
	}
}

export function removeStoredGroupID(id: GroupID): void {
	const groupIDs = readStoredGroupIDs().filter((g) => g !== id);
	storeGroupIDs(groupIDs);
}
