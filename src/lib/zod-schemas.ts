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
	quotes: {
		create: z.object({
			text: z.string(),
			person: z.string().optional(),
			quotedAt: z.iso.datetime({ local: true }),
		}),
		search: z.object({
			text: z.string().optional(),
			person: z.string().optional(),
		}),
	},
	users: {
		register: z.object({
			name: z.string().min(1).max(128),
			email: z.email(),
			password: z.string().min(8).max(128),
		}),
		login: z.object({
			email: z.string(),
			password: z.string(),
		}),
	},
};
