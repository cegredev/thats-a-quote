const genKey = (key: string) => `thats-a-quote:${key}`;
const VERSION_KEY = genKey("local-storage-version");
const GROUPS_KEY = genKey("groups");

type Version = {
	next?: string;
	migrateTo?: (storage: Storage) => void;
};

const versions: Record<string, Version> = {
	"0": {
		next: "1",
	},
	"1": {
		migrateTo: (storage: Storage) => {
			const genKey = (key: string) => `thats-a-quote:${key}`;
			const OLD_GROUPS_KEY = genKey("groups");

			const groups = JSON.parse(
				storage.getItem(OLD_GROUPS_KEY) ?? "[]",
			) as {
				id: string;
				name: string;
				password: string | null;
			}[];

			storage.removeItem(OLD_GROUPS_KEY);

			storage.setItem(
				GROUPS_KEY,
				JSON.stringify(groups.map((g) => g.id)),
			);
		},
	},
};

export const migrateStorage = () => {
	if (!window?.localStorage) {
		console.error(
			"Tried to migrate, but window.localStorage does not exist!",
		);
		return;
	}

	let versionKey = window.localStorage.getItem(VERSION_KEY) ?? "0";
	let version = versions[versionKey];
	while (version.next) {
		versionKey = version.next;
		version = versions[versionKey];
		if (!version.migrateTo) continue;

		version.migrateTo(window.localStorage);
	}

	window.localStorage.setItem(VERSION_KEY, versionKey);
};

export type GroupID = string;
export type Group = { id: GroupID; name: string };

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
