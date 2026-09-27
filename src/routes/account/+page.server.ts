import zodSchemas from "$lib/zod-schemas";
import type { PageServerLoad } from "./$types";
import { setError, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { error, fail, type RequestEvent } from "@sveltejs/kit";
import { auth } from "$lib/server/auth";
import { isAPIError } from "better-auth/api";
import {
	RateLimiter,
	type Rate,
	type RateLimiterPlugin,
} from "sveltekit-rate-limiter/server";

export const load: PageServerLoad = async ({ locals }) => {
	const loginForm = await superValidate(zod4(zodSchemas.users.login));
	const registerForm = await superValidate(zod4(zodSchemas.users.register));

	return {
		loginForm,
		registerForm,
	};
};

const registerLimiter = new RateLimiter({
	IP: [
		[15, "h"],
		[5, "m"],
	],
});

class LoginRateLimiter implements RateLimiterPlugin {
	// Shortest rate, so it will be executed first
	readonly rate: Rate[] = [
		[5, "m"],
		[15, "h"],
	];

	async hash(_: RequestEvent, extraData: { username: string }) {
		return extraData.username;
	}
}
const loginLimiter = new RateLimiter<{ username: string }>({
	IP: [
		[15, "h"],
		[5, "m"],
	],
	plugins: [new LoginRateLimiter()],
});

export const actions = {
	register: async (event) => {
		if (await registerLimiter.isLimited(event))
			throw error(429, "rate limited");

		const form = await superValidate(
			event.request,
			zod4(zodSchemas.users.register),
		);

		if (!form.valid) {
			// Return { form } and things will just work.
			return fail(400, { form });
		}

		await auth.api.signUpEmail({
			body: {
				name: form.data.name,
				email: form.data.email,
				password: form.data.password,
			},
		});

		return { form };
	},
	login: async (event) => {
		const form = await superValidate(
			event.request,
			zod4(zodSchemas.users.login),
		);

		if (!form.valid) {
			// Return { form } and things will just work.
			return fail(400, { form });
		}

		if (await loginLimiter.isLimited(event, { username: form.data.email }))
			throw error(429, "rate limited");

		try {
			await auth.api.signInEmail({
				body: {
					email: form.data.email,
					password: form.data.password,
				},
			});
		} catch (error) {
			if (isAPIError(error)) {
				console.log(error.message, error.status);

				return setError(form, "", "Invalid username or password");
			}

			console.error(error);
		}

		return { form };
	},
};
