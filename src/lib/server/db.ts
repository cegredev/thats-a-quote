import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const DB_PATH = process.env.DATABASE_PATH || "data/my-friendly-quotes.sqlite3";

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

export const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
	CREATE TABLE IF NOT EXISTS groups (
		id TEXT PRIMARY KEY,
		name TEXT NOT NULL,
		password_hash TEXT,
		created_at INTEGER NOT NULL
	);

	CREATE TABLE IF NOT EXISTS quotes (
		id TEXT PRIMARY KEY,
		group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
		text TEXT NOT NULL,
		person TEXT NOT NULL,
		created_at INTEGER NOT NULL
	);
	CREATE INDEX IF NOT EXISTS idx_quotes_group ON quotes(group_id);

	CREATE TABLE IF NOT EXISTS accounts (
		id TEXT PRIMARY KEY,
		username TEXT UNIQUE NOT NULL,
		password_hash TEXT NOT NULL,
		vault TEXT NOT NULL DEFAULT '[]',
		updated_at INTEGER NOT NULL
	);
`);
