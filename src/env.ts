import { defineEnvVars } from "@sveltejs/kit/env";
import z from "zod";

export const variables = defineEnvVars({
	DISABLE_PRETTY_LOGS: {
		description: "If true, the app will output JSON logs.",
		schema: z.stringbool().default(false),
	},
	DUMMY_DATA_INTERVAL_SECONDS: {
		description:
			"The interval in seconds at which to reset and fill the database with dummy data. A value of 0 will only run it once on startup and leaving it blank will disable this feature.",
		schema: z
			.string()
			.optional()
			.transform((v) => (v ? Number(v) : undefined)),
		public: true,
	},
});
