import { dev } from "$app/env";
import { DISABLE_PRETTY_LOGS } from "$app/env/private";
import pino from "pino";

const prettyLogs = dev || !DISABLE_PRETTY_LOGS;

export const logger = pino({
	transport: prettyLogs
		? {
				target: "pino-pretty",
				options: {
					colorize: true,
					translateTime: "SYS:standard",
					ignore: "pid,hostname",
				},
			}
		: undefined,
});

process.on("uncaughtException", (err) => {
	logger.fatal({ err }, "uncaught exception");
	process.exit(1);
});

process.on("unhandledRejection", (err) => {
	logger.fatal({ err }, "unhandled rejection");
	process.exit(1);
});
