<script lang="ts">
	import type { Snippet } from "svelte";
	import { m } from "#lib/paraglide/messages.js";

	let {
		children,
		switchHref,
		switchLabel,
	}: {
		children: Snippet;
		switchHref: string;
		switchLabel: string;
	} = $props();
</script>

<div class="auth">
	<section aria-labelledby="auth-title">
		<header>
			<h1 id="auth-title">{m.account_title()}</h1>
			<p>{m.account_intro()}</p>
		</header>

		<div class="card">
			{@render children()}
			<p class="switch">
				<a href={switchHref}>{switchLabel}</a>
			</p>
		</div>
	</section>
</div>

<style>
	.auth {
		display: grid;
		min-height: calc(100svh - var(--nav-height, 0px) - 10rem);
		place-items: center;
		padding-block: 2rem 4rem;
		background: radial-gradient(
			ellipse at 50% 25%,
			color-mix(in srgb, var(--primary) 8%, transparent),
			transparent 65%
		);
	}

	.auth section {
		width: min(100%, 28rem);
	}

	.auth header {
		margin-bottom: 1.5rem;
		text-align: center;
	}

	.auth h1 {
		margin: 0;
		font-family: var(--font-display);
		font-size: clamp(2.25rem, 8vw, 3rem);
		font-weight: 600;
		letter-spacing: -0.04em;
		line-height: 1.1;
	}

	.auth header p {
		max-width: 32rem;
		margin: 0.75rem auto 0;
		color: var(--muted-foreground);
		line-height: 1.6;
	}

	.card {
		display: grid;
		gap: 1.5rem;
		padding: clamp(1.5rem, 5vw, 2rem);
		border: 1px solid var(--border);
		border-radius: 1.25rem;
		background: var(--card);
		box-shadow: 0 20px 60px -38px color-mix(in srgb, var(--foreground) 50%, transparent);
	}

	.switch {
		margin: 0;
		padding-top: 1.25rem;
		border-top: 1px solid var(--border);
		color: var(--muted-foreground);
		font-size: 0.875rem;
		text-align: center;
	}

	.switch a {
		color: var(--primary);
		font-weight: 600;
		text-decoration: none;
	}

	.switch a:hover {
		text-decoration: underline;
		text-underline-offset: 0.2em;
	}
</style>
