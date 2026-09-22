import type { GroupID } from "$lib/types";

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

export function migrateStorage(): void {
	if (!hasStorage()) {
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
}

function loadInitialGroupIDs(): GroupID[] {
	if (!hasStorage()) return [];
	migrateStorage();
	return safeParse<GroupID[]>(window.localStorage.getItem(GROUPS_KEY), []);
}

/**
 * Reactive store for the list of stored group IDs. `ids` is a Svelte 5
 * `$state` array, so reading `groupIDsStore.ids` inside a component or
 * `$derived`/`$effect` will react to any change, no matter how the array
 * is mutated (push, filter+reassign, direct set, etc).
 *
 * A single `$effect` persists the array to localStorage whenever it
 * changes, so callers no longer need to remember to call a setter.
 */
class GroupIDsStore {
	ids = $state<GroupID[]>(loadInitialGroupIDs());

	constructor() {
		// $effect.root gives us a standalone reactive scope, since this
		// store lives outside any component. It's never torn down here
		// because the store is meant to live for the lifetime of the app;
		// the cleanup function is returned in case you ever need it.
		$effect.root(() => {
			$effect(() => {
				console.log("running effect");
				// Reading this.ids here is what makes the effect re-run
				// whenever the array changes.
				const ids = this.ids;

				if (!hasStorage()) return;
				window.localStorage.setItem(GROUPS_KEY, JSON.stringify(ids));
			});
		});
	}

	add(groupID: GroupID): void {
		if (!this.ids.includes(groupID)) {
			this.ids.push(groupID);
		}
	}

	remove(id: GroupID): void {
		this.ids = this.ids.filter((g) => g !== id);
	}

	has(groupID: GroupID): boolean {
		return this.ids.includes(groupID);
	}

	set(groupIDs: GroupID[]): void {
		this.ids = groupIDs;
	}
}

export const groupIDsStore = new GroupIDsStore();
