export const DRAWERS = {
	CREATE_GROUP: "create-group",
	EDIT_GROUP: "edit-group",
	CREATE_QUOTE: "create-quote",
	EDIT_QUOTE: "edit-quote",
	EDIT_USER: "edit-user",
	REQUIRE_LOGIN: "require-login",
	LEAVE_GROUP: "leave-group",
	SHARE_QUOTE: "share-quote",
} as const;

export type DrawerParams = {
	"create-group": {};
	"edit-group": {
		id: string;
	};
	"create-quote": {};
	"edit-quote": {
		id: string;
	};
	"edit-user": {};
	"require-login": {};
	"leave-group": {};
	"share-quote": {
		id: string;
	};
};

export type DrawerKey = (typeof DRAWERS)[keyof typeof DRAWERS];

export const DRAWER_QUERY_PARAM = "drawer" as const;
