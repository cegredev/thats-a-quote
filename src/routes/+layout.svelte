<script lang="ts">
	import { m } from "#lib/paraglide/messages.js";
	import "../app.css";
	import type { LayoutProps } from "./$types";
	import { onMount } from "svelte";
	import { authClient } from "#lib/client/frontend-auth.js";
	import NavTabs from "#lib/components/tabs/NavTabs.svelte";
	import HouseIcon from "@lucide/svelte/icons/house";
	import SettingsIcon from "@lucide/svelte/icons/settings";
	import UserRound from "@lucide/svelte/icons/user";
	import ResponsiveDrawer from "#lib/components/drawer/ResponsiveDrawer.svelte";
	import { removeDrawerNavigationHistory } from "#lib/client/drawers.svelte.ts";
	import * as Button from "#lib/shadcn/components/ui/button/index.js";
	import { Toaster } from "#lib/shadcn/components/ui/sonner/index.ts";

	let { data, children }: LayoutProps = $props();

	onMount(() => {
		authClient.hydrateSession(data.session);
	});

	const session = authClient.useSession();
	const currentSession = $derived(
		$session.isPending ? data.session : $session.data,
	);
</script>

<div class="min-h-screen bg-background">
	<header class="border-b border-border">
		<div
			class="mx-auto flex max-w-3xl items-center justify-between px-2 py-2"
		>
			<a
				href="/"
				class="font-display text-xl font-semibold tracking-tight flex gap-1 items-center"
			>
				<img src="/icon-512x512.png" class="h-[44px]" alt={m.brand()} />
				<span>{m.brand()}</span>
			</a>

			<div class="flex items-center gap-4">
				{#if currentSession?.user}
					<a
						href="/user"
						aria-label={m.login_link()}
						class="text-sm text-muted-foreground underline-offset-4 hover:underline"
					>
						<div
							class="grid place-items-center p-[6px] rounded-full bg-gray-300/30"
							aria-hidden="true"
						>
							<UserRound class="size-6" />
						</div>
					</a>
				{:else}
					<Button.Root
						variant="outline"
						size="sm"
						class="shrink-0"
						href="/user"
					>
						{m.login_link()}
					</Button.Root>
				{/if}
			</div>
		</div>
	</header>

	<main class="mx-auto max-w-3xl px-5 pt-4">
		{@render children()}
	</main>

	<div style="height: calc(var(--nav-height) + 10px)"></div>

	<nav
		class="flex mx-auto lg:max-w-xl lg:py-2 justify-center fixed left-1/2 -translate-x-1/2 z-50 w-full bottom-nav"
		style="height: var(--nav-height)"
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

<Toaster richColors position="top-center" />

<style>
	.bottom-nav {
		bottom: calc(env(safe-area-inset-bottom, 0px) * -1);
	}
</style>
