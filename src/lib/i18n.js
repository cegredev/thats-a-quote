import { browser } from "$app/environment";
import { _, init, locale, register } from "svelte-i18n";
import en from "$lib/locales/en.js";
import de from "$lib/locales/de.js";

const LOCALE_KEY = "my-friendly-quotes:locale";

register("en", () => Promise.resolve(en));
register("de", () => Promise.resolve(de));

init({
	fallbackLocale: "en",
	initialLocale: browser ? localStorage.getItem(LOCALE_KEY) || "en" : "en",
});

/** @param {string} value */
export function setLanguage(value) {
	const next = value === "de" ? "de" : "en";
	locale.set(next);
	if (browser) localStorage.setItem(LOCALE_KEY, next);
}

export { _, locale };
