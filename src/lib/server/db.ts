import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const DB_PATH = process.env.DATABASE_PATH || "data/db.sqlite3";

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";

// You can specify any property from the libsql connection options
export const db = drizzle({ connection: { url: process.env.DB_FILE_NAME! } });
