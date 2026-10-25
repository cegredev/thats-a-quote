import { defineConfig } from "jsrepo";

export default defineConfig({
	// configure where stuff comes from here
	registries: ["@ieedan/shadcn-svelte-extras"],
	// configure where stuff goes here
	paths: {
		ui: "src/lib/shadcn/components/ui",
		component: "src/lib/shadcn/components",
		block: "src/lib/shadcn/components",
		hook: "src/lib/shadcn/hooks",
		action: "$src/ib/shadcn/actions",
		util: "src/lib/shadcn/utils",
		lib: "src/lib",
	},
});
