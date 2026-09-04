// The browser's local storage is the only "account" a user needs by default.
// It holds a list of the groups they've created or joined, each with the
// group's id, a cached name, and its password (if any) so they don't have
// to retype it every visit.

const GROUPS_KEY = "my-friendly-quotes:groups";
const ACCOUNT_KEY = "my-friendly-quotes:account";

function hasStorage() {
	return (
		typeof window !== "undefined" &&
		typeof window.localStorage !== "undefined"
	);
}

function safeParse(raw, fallback) {
	if (!raw) return fallback;
	try {
		const parsed = JSON.parse(raw);
		return parsed ?? fallback;
	} catch {
		return fallback;
	}
}

/** @returns {{id: string, name: string, password: string|null}[]} */
export function loadGroups() {
	if (!hasStorage()) return [];
	return safeParse(window.localStorage.getItem(GROUPS_KEY), []);
}

export function saveGroups(groups) {
	if (!hasStorage()) return;
	window.localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
}

export function getStoredGroup(id) {
	return loadGroups().find((g) => g.id === id) || null;
}

export function upsertStoredGroup(group) {
	const groups = loadGroups();
	const index = groups.findIndex((g) => g.id === group.id);
	if (index === -1) {
		groups.unshift(group);
	} else {
		groups[index] = { ...groups[index], ...group };
	}
	saveGroups(groups);
	return groups;
}

export function removeStoredGroup(id) {
	const groups = loadGroups().filter((g) => g.id !== id);
	saveGroups(groups);
	return groups;
}

export function loadAccount() {
	if (!hasStorage()) return null;
	return safeParse(window.localStorage.getItem(ACCOUNT_KEY), null);
}

export function saveAccount(account) {
	if (!hasStorage()) return;
	if (account) {
		window.localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
	} else {
		window.localStorage.removeItem(ACCOUNT_KEY);
	}
}
