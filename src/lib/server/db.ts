import fs from "node:fs";
import path from "node:path";

const DB_PATH = process.env.DATABASE_PATH || "data/db.sqlite3";

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import { authRelations, relations } from "./db/relations";

// You can specify any property from the libsql connection options
export const db = drizzle({
	connection: { url: process.env.DB_FILE_NAME! },
	relations: { ...relations, ...authRelations },
});
