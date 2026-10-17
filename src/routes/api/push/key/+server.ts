import { getVapidKeys } from "#lib/server/push-vapid.ts";

export const GET = async () => {
	const { publicKey } = getVapidKeys();
	return Response.json({ publicKey });
};
