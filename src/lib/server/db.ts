import fs from "node:fs";
import path from "node:path";
import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { authRelations, relations } from "./db/relations";
import { DATA_DIR } from "$app/env/private";

const DB_PATH = path.join(DATA_DIR, "db.sqlite3");

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

export const db = drizzle({
	connection: { url: `file:${DB_PATH}` },
	relations: { ...relations, ...authRelations },
});

await migrate(db, {
	migrationsFolder: "drizzle",
});
