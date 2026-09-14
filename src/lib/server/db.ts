import fs from "node:fs";
import path from "node:path";

const DB_PATH = process.env.DATABASE_PATH ?? "data/db.sqlite3";
const MIGRATIONS_PATH = process.env.MIGRATIONS_PATH ?? "drizzle";

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

import { authRelations, relations } from "./db/relations";

// You can specify any property from the libsql connection options
export const db = drizzle({
	connection: { url: "file:" + DB_PATH },
	relations: { ...relations, ...authRelations },
});

await migrate(db, {
	migrationsFolder: MIGRATIONS_PATH,
});
