/**
 * Site chrome and Pinki's speech switch language; the taught content
 * (numbers, letters, colors) never does — see CLAUDE.md's language switcher
 * conventions.
 *
 * `ku` is Badini (Behdinî) Kurdish, written in the Arabic-based Kurdish
 * alphabet — so it is right-to-left text like `ar`, and everything that
 * branches on direction has to ask `dirFor()` rather than test for `"ar"`.
 */
export type Locale = "en" | "ar" | "ku";

/** The one list of what a valid locale is, so the cookie reader and anything
    else validating untrusted input agree by construction. */
export const LOCALES = ["en", "ar", "ku"] as const;

export function isLocale(value: string | undefined): value is Locale {
  return LOCALES.includes(value as Locale);
}

export const LOCALE_COOKIE = "edenic-locale";
