import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config({
	path: ".env.development",
});

export default defineConfig({
	out: "./drizzle",
	schema: "./src/lib/server/db/schema.ts",
	dialect: "sqlite",
	dbCredentials: {
		url: process.env.BASE_DIR! + "data/db.sqlite3",
	},
});
