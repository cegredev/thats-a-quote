<script lang="ts">
	import { getLocale, locales, setLocale } from "#lib/paraglide/runtime.js";
	import GeneralSelect from "../util/GeneralSelect.svelte";

	let locale = $state(getLocale());

	function onLocaleChange(value: string) {
		if (value === "en" || value === "de") {
			locale = value;
			setLocale(value);
		}
	}

	const localesWithNames = locales.map((locale) => ({
		locale,
		name: new Intl.DisplayNames([locale], {
			type: "language",
		}).of(locale),
	}));

	const items = localesWithNames.map(({ locale, name }) => ({
		value: locale,
		label: name ?? locale,
	}));
</script>

<GeneralSelect bind:value={locale} {items} onValueChange={onLocaleChange} />
