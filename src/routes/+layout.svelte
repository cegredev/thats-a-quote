<script>
	import "../app.css";
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
				My Friendly Quotes
			</a>
			<a
				href="/account"
				class="link link-hover text-sm text-base-content/70"
				>Sync devices</a
			>
		</div>
	</header>

	<main class="mx-auto max-w-3xl px-5 py-8">
		{@render children()}
	</main>
</div>
