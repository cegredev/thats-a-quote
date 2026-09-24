export type GroupID = string;
export type Group = { id: GroupID; name: string };

export type MaybePromise<T> = T | Promise<T>;
