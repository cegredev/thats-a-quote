import { drizzleCrud } from "../crud";
import { zod } from "../crud/zod";
import { db } from "../db";
import { groupsTable, quotesTable } from "./schema";

const crud = drizzleCrud(db, { validation: zod() });

export const quotesCrud = crud(quotesTable, {
	allowedFilters: ["groupId", "text", "person"],
});

export const groupsCrud = crud(groupsTable, {
	allowedFilters: ["id"],
});
