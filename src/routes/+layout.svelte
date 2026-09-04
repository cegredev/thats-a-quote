<script>
	import "../app.css";
	import { _, locale, setLanguage } from "$lib/i18n.js";
	let { children } = $props();
</script>

<div class="min-h-screen bg-base-100" data-theme="my-friendly-quotes">
	<header class="border-b border-base-300">
		<div
			class="mx-auto flex max-w-3xl items-center justify-between px-5 py-4"
		>
			<a
				href="/"
				class="font-display text-xl font-semibold tracking-tight"
			>
				{$_("brand")}
			</a>
			<div class="flex items-center gap-4">
				<a
					href="/account"
					class="link link-hover text-sm text-base-content/70"
					>{$_("syncDevices")}</a
				>
				<label
					class="flex items-center gap-2 text-sm text-base-content/70"
				>
					<span class="sr-only">{$_("language")}</span>
					<select
						class="select select-bordered select-xs"
						value={$locale}
						onchange={(event) =>
							setLanguage(event.currentTarget.value)}
						aria-label={$_("language")}
					>
						<option value="en">{$_("english")}</option>
						<option value="de">{$_("german")}</option>
					</select>
				</label>
			</div>
		</div>
	</header>

	<main class="mx-auto max-w-3xl px-5 py-8">
		{@render children()}
	</main>
</div>
