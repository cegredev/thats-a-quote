import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const DB_PATH = process.env.DATABASE_PATH || "data/my-friendly-quotes.sqlite3";

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

export const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

type Migration = { version: number; up: () => void };

const migrations: Migration[] = [
	{
		version: 1,
		up: () => {
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
		},
	},
	{
		version: 2,
		up: () => {
			db.exec(`
				ALTER TABLE quotes ADD COLUMN quoted_at INTEGER NOT NULL DEFAULT 0;
				UPDATE quotes SET quoted_at = created_at WHERE quoted_at = 0;
			`);
		},
	},
];

db.exec(`
	CREATE TABLE IF NOT EXISTS schema_migrations (
		version INTEGER PRIMARY KEY,
		applied_at INTEGER NOT NULL
	);
`);

const appliedVersions = new Set(
	(
		db.prepare("SELECT version FROM schema_migrations").all() as Array<{
			version: number;
		}>
	).map((row) => row.version),
);

for (const migration of migrations) {
	if (appliedVersions.has(migration.version)) continue;
	const applyMigration = db.transaction(() => {
		migration.up();
		db.prepare(
			"INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)",
		).run(migration.version, Date.now());
	});
	applyMigration();
}
