<script lang="ts">
	import { m } from "#lib/paraglide/messages.js";
	import "../app.css";
	import LocaleSwitcher from "#lib/components/meta/LocaleSwitcher.svelte";
	import type { LayoutProps } from "./$types";
	import { onMount } from "svelte";
	import { authClient } from "#lib/client/frontend-auth.js";
	import NavTabs from "#lib/components/tabs/NavTabs.svelte";
	import { HouseIcon, SettingsIcon } from "@lucide/svelte";

	let { data, children }: LayoutProps = $props();

	onMount(() => {
		// Removes flickering of the login state on page load
		// We do this here to avoid a warning in the load function about fetch
		authClient.hydrateSession(data.session);
	});
</script>

<div class="min-h-screen bg-base-100" data-theme="thats-a-quote">
	<header class="border-b border-base-300">
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
					href="/account"
					class="link link-hover text-sm text-base-content/70"
				>
					{m.syncDevices()}
				</a>

				<LocaleSwitcher />
			</div>
		</div>
	</header>

	<main class="mx-auto max-w-3xl px-5 py-8">{@render children()}</main>

	<nav
		class="flex mx-auto lg:max-w-xl lg:py-5 justify-center fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full"
	>
		<NavTabs
			values={["home", "settings"]}
			configs={{
				home: {
					icon: HouseIcon,
					label: "Home",
					navigate: "/",
				},
				settings: {
					icon: SettingsIcon,
					label: "Settings",
					navigate: "/settings",
				},
			}}
		/>
	</nav>
</div>
