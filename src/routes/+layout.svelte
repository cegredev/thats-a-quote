<script lang="ts">
	import type { Pathname } from "$app/types";
	import { resolve } from "$app/paths";
	import { page } from "$app/state";
	import {
		getLocale,
		locales,
		localizeHref,
		setLocale,
	} from "$lib/paraglide/runtime";
	import { m } from "$lib/paraglide/messages";
	import "../app.css";

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
				>{m.brand()}</a
			>

			<div class="flex items-center gap-4">
				<a
					href="/account"
					class="link link-hover text-sm text-base-content/70"
					>{m.syncDevices()}</a
				>

				<label
					class="flex items-center gap-2 text-sm text-base-content/70"
				>
					<span class="sr-only">{m.language()}</span>

					<select
						class="select select-bordered select-xs"
						value={getLocale()}
						onchange={(event) =>
							setLocale(event.currentTarget.value as any)}
						aria-label={m.language()}
					>
						<option value="en">{m.english()}</option>
						<option value="de">{m.german()}</option>
					</select>
				</label>
			</div>
		</div>
	</header>

	<main class="mx-auto max-w-3xl px-5 py-8">{@render children()}</main>
</div>

<div style="display:none">
	{#each locales as locale (locale)}
		<a
			href={resolve(
				localizeHref(page.url.pathname, { locale }) as Pathname,
			)}>{locale}</a
		>
	{/each}
</div>
