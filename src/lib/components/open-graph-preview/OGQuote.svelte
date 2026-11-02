<svelte:options css="injected" />

<script lang="ts">
	import type { Quote } from "#lib/zod-schemas.ts";
	import { m } from "#lib/paraglide/messages.js";
	import { getLocale } from "#lib/paraglide/runtime.js";

	let { quote }: { quote: Quote } = $props();

	function formatDate(ts: Date): string {
		return ts.toLocaleString(getLocale() === "de" ? "de-DE" : "en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		});
	}
</script>

<div
	style="display: flex; flex-direction: column; justify-content: center; width: 100%; height: 100%; padding: 64px; background-color: #f5f5f5; color: #101011; text-shadow: none; -webkit-text-stroke: 0 transparent;"
>
	<p
		style="margin: 0; font-size: 48px; line-height: 1.2; text-align: center;"
	>
		&ldquo;{quote.text}&rdquo;
	</p>
	<p
		style="margin: 32px 0 0; color: #a1a1aa; font-size: 22px; text-align: center;"
	>
		<span style:font-style={quote.person ? "normal" : "italic"}>
			— {quote.person ?? m.group_anonymousPersonDisplay()}
		</span>
		· {formatDate(quote.quotedAt)}
	</p>
</div>
