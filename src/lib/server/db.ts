import fs from "node:fs";
import path from "node:path";
import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { authRelations, relations } from "./db/relations";
import { BASE_DIR } from "$app/env/private";
import { building } from "$app/env";

const DB_PATH = () => path.join(BASE_DIR, "data", "db.sqlite3");

const createDB = () =>
	drizzle({
		connection: { url: `file:${DB_PATH()}` },
		relations: { ...relations, ...authRelations },
	});
type DB = ReturnType<typeof createDB>;

let _db: DB | undefined = undefined;

export const db: () => DB = () => {
	if (_db !== undefined) return _db;

	_db = createDB();

	return _db;
};

if (!building) {
	fs.mkdirSync(path.dirname(DB_PATH()), { recursive: true });

	await migrate(db(), {
		migrationsFolder: path.join(BASE_DIR, "drizzle"),
	});
}
