import path from "node:path";
import type z from "zod";
import { BASE_DIR } from "$app/env/private";
import fs from "node:fs";

export function parseSearchParams(
	searchParams: URLSearchParams,
): Record<string, string>;

export function parseSearchParams<TSchema extends z.ZodType>(
	searchParams: URLSearchParams,
	schema: TSchema,
): z.infer<TSchema>;

export function parseSearchParams<TSchema extends z.ZodType>(
	searchParams: URLSearchParams,
	schema?: TSchema,
): Record<string, string> | z.infer<TSchema> {
	const searchRaw = Object.fromEntries(searchParams.entries());

	if (schema) {
		const result = schema.safeParse(searchRaw);
		return result.success ? result.data : {};
	}

	return searchRaw;
}

export function parsePaginationParams(searchParams: URLSearchParams) {
	const page = parseInt(searchParams.get("page") ?? "");
	const perPage = parseInt(searchParams.get("perPage") ?? "");

	return {
		page: isNaN(page) ? undefined : page,
		perPage: isNaN(perPage) ? undefined : perPage,
	};
}

let pathsInitialized: boolean = false;

export const paths = () => {
	const DATA_DIR = path.join(BASE_DIR, "data");
	const DRIZZLE_DIR = path.join(BASE_DIR, "drizzle");

	if (!pathsInitialized) {
		fs.mkdirSync(DATA_DIR, { recursive: true });

		pathsInitialized = true;
	}

	return {
		DRIZZLE_DIR,
		data: {
			join: (...p: string[]) => path.join(DATA_DIR, ...p),
		},
	};
};
