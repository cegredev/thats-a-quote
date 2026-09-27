import {
	RateLimiter,
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

export const RATE_LIMIT_CONFIGS = {
	strict: {
		IP: [
			[10, "m"],
			[30, "h"],
		],
		IPUA: [
			[5, "m"],
			[20, "h"],
		],
	},
	medium: {
		IP: [
			[15, "m"],
			[60, "h"],
		],
		IPUA: [
			[10, "m"],
			[30, "h"],
		],
	},
} as const satisfies Record<string, RateLimitConfig>;

export const rateLimit = (
	config: RateLimitConfig | keyof typeof RATE_LIMIT_CONFIGS,
	handler: Action,
): Action => {
	if (!(config instanceof Object)) {
		config = RATE_LIMIT_CONFIGS[config];
	}

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

		return await handler(event);
	};
};

class LoggedInUserRateLimiter implements RateLimiterPlugin {
	readonly rate: Rates;

	constructor(rate: Rates) {
		this.rate = rate;
	}

	async hash(event: RequestEvent) {
		const userId = event.locals.user?.id;
		if (!userId) return false;

		return userId;
	}
}

type ExtraDataType = { keys: string[] };

export class ExtraDataRateLimiter implements RateLimiterPlugin<ExtraDataType> {
	readonly rate: Rates;

	constructor(rate: Rates) {
		this.rate = rate;
	}

	async hash(_: RequestEvent, extraData: ExtraDataType) {
		return extraData.keys.join(",");
	}
}

export const limiterOnData = (rates: Rates) =>
	new RetryAfterRateLimiter<ExtraDataType>({
		plugins: [new ExtraDataRateLimiter(rates)],
	});
