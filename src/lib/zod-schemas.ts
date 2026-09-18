import { z } from "zod";

export default {
	groups: {
		create: z.object({
			name: z
				.string()
				.min(1, { message: "Group name cannot be empty" })
				.max(100, {
					message: "Group name cannot exceed 100 characters",
				}),
			id: z.string().optional(),
		}),
	},
};
