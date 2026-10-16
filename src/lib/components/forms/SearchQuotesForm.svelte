<script lang="ts">
	import { page } from "$app/state";
	import { m } from "#lib/paraglide/messages.js";
	import { Button } from "#lib/components_shadcn/ui/button/index.js";
	import { Input } from "#lib/components_shadcn/ui/input/index.js";
</script>

<form
	class="mb-6 grid gap-3 rounded-lg border bg-card p-4 sm:grid-cols-[1fr_1fr_auto]"
	method="GET"
>
	<Input
		class="w-full"
		placeholder={m["group.searchContent"]()}
		name="text"
		value={page.url.searchParams.get("text") ?? ""}
	/>

	<Input
		class="w-full"
		placeholder={m["group.searchPerson"]()}
		name="person"
		value={page.url.searchParams.get("person") ?? ""}
	/>

	<div class="flex gap-2">
		<Button type="submit">{m["group.search"]()}</Button>

		<Button variant="ghost" href={page.url.pathname}>
			Clear
		</Button>
	</div>
</form>
