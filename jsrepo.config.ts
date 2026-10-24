import { defineConfig } from "jsrepo";

export default defineConfig({
	// configure where stuff comes from here
	registries: ["@ieedan/shadcn-svelte-extras"],
	// configure where stuff goes here
	paths: {
		ui: 'src/lib/components_shadcn/ui',
		component: 'src/lib/components_shadcn',
		block: 'src/lib/components_shadcn',
		hook: 'src/lib/hooks_shadcn',
		action: '$src/ib/actions_shadcn',
		util: 'src/lib/utils_shadcn',
		lib: 'src/lib',
	},
});
