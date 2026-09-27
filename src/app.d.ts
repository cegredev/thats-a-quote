// See https://svelte.dev/docs/kit/types#app.d.ts

import type { Session, User } from "better-auth";
import type { Logger } from "pino";

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			session: Session | null;
			user: User | null;
			logger: Logger;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
