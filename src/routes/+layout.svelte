<script lang="ts">
	import { m } from "$lib/paraglide/messages";
	import "../app.css";
	import LocaleSwitcher from "$lib/components/meta/LocaleSwitcher.svelte";

	let { children } = $props();
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
</div>
