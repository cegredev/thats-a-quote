import { getVapidKeys } from "#lib/server/vapid.ts";

export const GET = async () => {
	const { publicKey } = getVapidKeys();
	return Response.json({ publicKey });
};
