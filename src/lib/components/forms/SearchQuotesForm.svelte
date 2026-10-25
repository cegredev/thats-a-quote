<script lang="ts">
	import { page } from "$app/state";
	import { m } from "#lib/paraglide/messages.js";
	import { Button } from "#lib/shadcn/components/ui/button/index.js";
	import { Input } from "#lib/shadcn/components/ui/input/index.js";
</script>

<form
	class="mb-6 grid gap-3 rounded-lg border bg-card p-4 sm:grid-cols-[1fr_1fr_auto]"
	method="GET"
>
	<Input
		class="w-full"
		placeholder={m.group_searchContent()}
		name="text"
		value={page.url.searchParams.get("text") ?? ""}
	/>

	<Input
		class="w-full"
		placeholder={m.group_searchPerson()}
		name="person"
		value={page.url.searchParams.get("person") ?? ""}
	/>

	<div class="flex gap-2">
		<Button type="submit">{m.group_search()}</Button>

		<Button variant="ghost" href={page.url.pathname}>
			{m.group_clearSearch()}
		</Button>
	</div>
</form>
