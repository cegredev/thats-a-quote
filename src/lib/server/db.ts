import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { authRelations, relations } from "./db/relations";
import { building } from "$app/env";
import { paths } from "./utils";

const DB_PATH = () => paths().data.join("db.sqlite3");

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
	await migrate(db(), {
		migrationsFolder: paths().DRIZZLE_DIR,
	});
}
