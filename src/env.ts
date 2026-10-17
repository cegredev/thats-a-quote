import { building } from "$app/env";
import { defineEnvVars } from "@sveltejs/kit/env";
import z from "zod";

const optionalInBuild = <T extends z.ZodType>(schema: T): T =>
	// We are lying to typescript here because the optional schema
	// will only be there at build, not at runtime.
	// This is horrifying, but arguably better than providing fake
	// environment variables during CI/CD builds.
	building ? (schema.optional() as unknown as T) : schema;

export const variables = defineEnvVars({
	BASE_DIR: {
		description:
			"Base directory where all data is stored. Only meant to be modified in development, but do what you want to.",
		schema: optionalInBuild(z.string()),
	},
	AUTH_SECRET: {
		description:
			"The secret used for authentication. More information here: https://better-auth.com/docs/installation#set-environment-variables",
		schema: optionalInBuild(z.string()),
	},
	BASE_URL: {
		description:
			"The base URL of your deployment. For example http://localost:5173 or https://quotes.my-domain.com",
		schema: optionalInBuild(z.url()),
	},
	JSON_LOGS: {
		description: "If true, the app will output JSON logs.",
		schema: z.stringbool().default(false),
	},
	FILL_WITH_DUMMY_DATA: {
		description:
			"If true, the database will be populated with dummy data at startup. Leaves existing data intact.",
		schema: z.stringbool().default(false),
	},
	RESET_INTERVAL_SECONDS: {
		description:
			"The interval in seconds after which to reset the database. If FILL_WITH_DUMMY_DATA is true, the database will also be filled with dummy data. No value or a value <= 0 will disable this feature.",
		schema: z
			.string()
			.optional()
			.transform((v) => (v ? Number(v) : undefined)),
	},
	VAPID_SUBJECT: {
		description:
			"Needed for push notifications. This must be either a 'https:' URL or a 'mailto:' address. For example: 'https://my-site.com/contact' or 'mailto: contact@my-site.com'",
		schema: z
			.string()
			.regex(/^(mailto:|https:\/\/)/)
			.optional(),
	},
});
