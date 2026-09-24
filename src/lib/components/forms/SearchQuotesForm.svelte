<script lang="ts">
	import { page } from "$app/state";
	import { m } from "$lib/paraglide/messages";
</script>

<form
	class="mb-6 grid gap-3 rounded-box border border-base-300 bg-base-100 p-4 sm:grid-cols-[1fr_1fr_auto]"
	method="GET"
>
	<input
		class="input w-full"
		placeholder={m["group.searchContent"]()}
		name="text"
		value={page.url.searchParams.get("text") ?? ""}
	/>

	<input
		class="input w-full"
		placeholder={m["group.searchPerson"]()}
		name="person"
		value={page.url.searchParams.get("person") ?? ""}
	/>

	<div class="flex gap-2">
		<button class="btn btn-primary">{m["group.search"]()}</button>

		<a class="btn btn-ghost" type="button" href={page.url.pathname}>
			Clear
		</a>
	</div>
</form>
