<script lang="ts">
	import { m } from "#lib/paraglide/messages.js";
	import { getLocale, setLocale } from "#lib/paraglide/runtime.js";
	import * as Select from "#lib/components_shadcn/ui/select/index.js";

	let locale = $state(getLocale());

	function onLocaleChange(value: string) {
		if (value === "en" || value === "de") {
			locale = value;
			setLocale(value);
		}
	}
</script>

<Select.Root
	type="single"
	bind:value={locale}
	items={[
		{ value: "en", label: m.english() },
		{ value: "de", label: m.german() },
	]}
	onValueChange={onLocaleChange}
>
	<Select.Trigger class="h-7" aria-label={m.language()}>
		<Select.Value />
	</Select.Trigger>
	<Select.Content>
		<Select.Item value="en" label={m.english()} />
		<Select.Item value="de" label={m.german()} />
	</Select.Content>
</Select.Root>
