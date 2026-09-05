import { browser } from "$app/environment";
import { _, init, locale, register } from "svelte-i18n";
import en from "$lib/locales/en";
import de from "$lib/locales/de";

const LOCALE_KEY = "thats-a-quote:locale";

register("en", () => Promise.resolve(en));
register("de", () => Promise.resolve(de));

init({
	fallbackLocale: "en",
	initialLocale: browser ? localStorage.getItem(LOCALE_KEY) || "en" : "en",
});

export function setLanguage(value: string) {
	const next = value === "de" ? "de" : "en";
	locale.set(next);
	if (browser) localStorage.setItem(LOCALE_KEY, next);
}

export { _, locale };
