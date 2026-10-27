<script lang="ts">
	import { m } from "#lib/paraglide/messages.js";
	import "../app.css";
	import type { LayoutProps } from "./$types";
	import { onMount } from "svelte";
	import { authClient } from "#lib/client/frontend-auth.js";
	import NavTabs from "#lib/components/tabs/NavTabs.svelte";
	import { HouseIcon, SettingsIcon } from "@lucide/svelte";
	import ResponsiveDrawer from "#lib/components/drawer/ResponsiveDrawer.svelte";
	import { removeDrawerNavigationHistory } from "#lib/client/drawers.svelte.ts";
	import * as Button from "#lib/shadcn/components/ui/button/index.js";

	let { data, children }: LayoutProps = $props();

	onMount(() => {
		// Removes flickering of the login state on page load
		// We do this here to avoid a warning in the load function about fetch
		authClient.hydrateSession(data.session);
	});

	let navHeight: number | undefined = $state(undefined);

	const session = authClient.useSession();
</script>

<div
	class="min-h-screen bg-background"
	style={`--nav-height: ${navHeight ?? 0}px`}
>
	<header class="border-b border-border">
		<div
			class="mx-auto flex max-w-3xl items-center justify-between px-5 py-4"
		>
			<a
				href="/"
				class="font-display text-xl font-semibold tracking-tight"
			>
				{m.brand()}
			</a>

			<div class="flex items-center gap-4">
				<a
					href="/user"
					class="text-sm text-muted-foreground underline-offset-4 hover:underline"
				>
					{#if $session.data?.user}
						{m.logout_link()}
					{:else}
						{m.login_link()}
					{/if}
				</a>
			</div>
		</div>
	</header>

	<main class="mx-auto max-w-3xl px-5 pt-8">
		{@render children()}
	</main>

	<div style={`height: ${(navHeight ?? 0) + 10}px`}></div>

	<nav
		bind:clientHeight={navHeight}
		class="flex mx-auto lg:max-w-xl lg:py-2 justify-center fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full"
	>
		<NavTabs
			values={["home", "settings"]}
			configs={{
				home: {
					icon: HouseIcon,
					label: m.nav_home(),
					navigate: "/",
				},
				settings: {
					icon: SettingsIcon,
					label: m.nav_settings(),
					navigate: "/settings",
				},
			}}
		/>
	</nav>
</div>

<ResponsiveDrawer
	navigationControl="require-login"
	text={{
		title: m.login_required_title(),
		description: m.login_required_description(),
	}}
>
	<div class="grid grid-cols-2 gap-1">
		<Button.Root
			variant="outline"
			onclick={() => removeDrawerNavigationHistory("require-login")}
		>
			Cancel
		</Button.Root>
		<Button.Root href="/user">{m.login_link()}</Button.Root>
	</div>
</ResponsiveDrawer>
