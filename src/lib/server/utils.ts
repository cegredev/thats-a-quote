import type z from "zod";

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
