import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { accountsTable } from "./db/schema";
import { eq } from "drizzle-orm";

export type VaultEntry = { id: string; name: string; password: string | null };
export type AccountRow = {
	id: string;
	username: string;
	passwordHash: string;
	vault: string;
	updatedAt: number;
};

export async function getAccount(
	username: string,
): Promise<AccountRow | undefined> {
	const result = await db
		.select()
		.from(accountsTable)
		.where(eq(accountsTable.username, username));

	if (result.length !== 1) return undefined;

	return result[0];
}

export async function createAccount(username: string, password: string) {
	const id = nanoid(16);
	const passwordHash = bcrypt.hashSync(password, 10);

	await db.insert(accountsTable).values({
		id,
		username,
		passwordHash,
		vault: "[]",
		updatedAt: Date.now(),
	});

	return { id, username, vault: "[]" };
}

export async function verifyAccount(
	username: string,
	password: string,
): Promise<AccountRow | null> {
	const account = await getAccount(username);
	if (!account) return null;
	if (!bcrypt.compareSync(password, account.passwordHash)) return null;
	return account;
}

export async function saveVault(
	username: string,
	vault: VaultEntry[],
): Promise<void> {
	await db
		.update(accountsTable)
		.set({
			vault: JSON.stringify(vault),
			updatedAt: Date.now(),
		})
		.where(eq(accountsTable.username, username));
}

/** Union two vaults (lists of {id, name, password}) by group id. Client entries win on conflict
 *  since the browser is the source of truth for a password the user just typed. */
export function mergeVaults(
	serverVault: VaultEntry[],
	clientVault: VaultEntry[],
	removedGroupIds: string[] = [],
): VaultEntry[] {
	const byId = new Map<string, VaultEntry>();
	const removed = new Set(removedGroupIds);
	for (const entry of serverVault) {
		if (!removed.has(entry.id)) byId.set(entry.id, entry);
	}
	for (const entry of clientVault) byId.set(entry.id, entry);
	return Array.from(byId.values());
}
