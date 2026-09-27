import {
	RetryAfterRateLimiter,
	type Rate,
	type RateLimiterPlugin,
} from "sveltekit-rate-limiter/server";
import { error, type Action, type RequestEvent } from "@sveltejs/kit";

type Rates = Rate | Rate[];

type RateLimitConfig = {
	IP: Rates;
	IPUA: Rates;
	loggedIn?: Rates;
};

export const rateLimit = (
	config: RateLimitConfig,
	formAction: Action,
): Action => {
	const plugins: RateLimiterPlugin[] = [];

	if (config.loggedIn) {
		plugins.push(new LoggedInUserRateLimiter(config.loggedIn));
	}

	const limiter = new RetryAfterRateLimiter({
		// A rate is defined as [number, unit]
		IP: config.IP, // IP address limiter
		IPUA: config.IPUA, // IP + User Agent limiter
		plugins,
	});

	return async (event) => {
		const status = await limiter.check(event);
		if (status.limited) {
			throw error(
				429,
				`You are being rate limited. Please try after ${status.retryAfter} seconds.`,
			);

			// let response = new Response(
			// 	`You are being rate limited. Please try after ${status.retryAfter} seconds.`,
			// 	{
			// 		status: 429,
			// 		headers: { "Retry-After": status.retryAfter.toString() },
			// 	},
			// );
			// return response;
		}

		return await formAction(event);
	};
};

class LoggedInUserRateLimiter implements RateLimiterPlugin {
	readonly rate: Rate | Rate[];

	constructor(rate: Rate | Rate[]) {
		this.rate = rate;
	}

	async hash(event: RequestEvent) {
		const userId = event.locals.user?.id;
		if (!userId) return false;

		return userId;
	}
}
