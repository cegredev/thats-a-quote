import { defineEnvVars } from "@sveltejs/kit/env";
import z from "zod";

export const variables = defineEnvVars({
	DISABLE_PRETTY_LOGS: {
		description: "If true, the app will output JSON logs.",
		schema: z.coerce.boolean(),
	},
});
