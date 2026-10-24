import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { authRelations, relations } from "./db/relations";
import { building } from "$app/env";
import { paths } from "./utils";
import { better } from "better-drizzle";

const DB_PATH = () => paths().data.join("db.sqlite3");

const createDB = () => {
	const db = drizzle({
		connection: { url: `file:${DB_PATH()}` },
		relations: { ...relations, ...authRelations },
	});
	const betterDb = better(db);
	return {
		db,
		betterDb,
	};
};

type DB = ReturnType<typeof createDB>;
let _db: DB | undefined = undefined;

export const db: () => DB["db"] = () => {
	if (_db !== undefined) return _db.db;

	_db = createDB();

	return _db.db;
};

export const betterDb: () => DB["betterDb"] = () => {
	if (_db !== undefined) return _db.betterDb;

	_db = createDB();

	return _db.betterDb;
};

if (!building) {
	await migrate(db(), {
		migrationsFolder: paths().DRIZZLE_DIR,
	});
}
