import { drizzleCrud } from "../crud";
import { zod } from "../crud/zod";
import { db } from "../db";
import { groupsTable, quoteReactions, quotesTable } from "./schema";

const createCrud = () => {
	const crud = drizzleCrud(db(), { validation: zod() });

	return {
		quotes: crud(quotesTable, {
			allowedFilters: ["groupId", "text", "person"],
		}),
		groups: crud(groupsTable, {
			allowedFilters: ["id"],
		}),
		quoteReactions: crud(quoteReactions, {}),
	};
};

type CRUD = ReturnType<typeof createCrud>;

let _crud: CRUD | undefined = undefined;

export const crud: () => CRUD = () => {
	if (_crud !== undefined) return _crud;

	_crud = createCrud();

	return _crud;
};
