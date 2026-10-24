import { getUserGroupMemberships } from "../groups";

export const userIsMemberOfGroup = async (userId: string, groupId: string) => {
	const memberships = await getUserGroupMemberships(userId);

	return memberships.some((m) => m.groupId === groupId);
};
