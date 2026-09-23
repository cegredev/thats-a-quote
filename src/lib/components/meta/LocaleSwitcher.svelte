<script lang="ts">
	import { m } from "$lib/paraglide/messages";
	import { getLocale, setLocale } from "$lib/paraglide/runtime";
</script>

<label class="flex items-center gap-2 text-sm text-base-content/70">
	<span class="sr-only">{m.language()}</span>

	<select
		class="select select-bordered select-xs"
		value={getLocale()}
		onchange={(event) => setLocale(event.currentTarget.value as any)}
		aria-label={m.language()}
	>
		<option value="en">{m.english()}</option>
		<option value="de">{m.german()}</option>
	</select>
</label>
