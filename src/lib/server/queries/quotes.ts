import { betterDb } from "../db";

export const queryQuotesOfGroupWithPagination = async (
	groupId: string,
	page: number,
	perPage: number,
	search?: {
		text?: string;
		person?: string;
	},
) =>
	await betterDb().quotesTable.paginate({
		where: {
			groupId,
			person: {
				contains: search?.person,
			},
			text: {
				contains: search?.text,
			},
		},
		limit: perPage,
		skip: (page - 1) * perPage,
		include: {
			reactions: {
				select: {
					content: true,
					user: {
						select: {
							id: true,
						},
					},
				},
			},
		},
		orderBy: {
			quotedAt: "desc",
			createdAt: "desc",
		},
	});

export type GroupQuotesPagination = Awaited<
	ReturnType<typeof queryQuotesOfGroupWithPagination>
>;
export type QuoteWithRest = GroupQuotesPagination["data"][number];
