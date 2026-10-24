import type { BetterDrizzleModelDelegate } from "better-drizzle";

export type GroupID = string;
export type Group = { id: GroupID; name: string };

export type MaybePromise<T> = T | Promise<T>;

export type BetterPagination = Awaited<
	ReturnType<BetterDrizzleModelDelegate<any, any>["paginate"]>
>["pagination"];
