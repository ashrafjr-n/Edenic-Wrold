import "server-only";
import { cookies } from "next/headers";
import { LOCALE_COOKIE, isLocale, type Locale } from "@/types/locale";
import { en, type Dictionary } from "./dictionaries/en";
import { ar } from "./dictionaries/ar";
import { ku } from "./dictionaries/ku";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const saved = store.get(LOCALE_COOKIE)?.value;
  /* A cookie is untrusted input: anything that isn't a locale we ship falls
     back to English rather than indexing `DICTIONARIES` with it. */
  return isLocale(saved) ? saved : "en";
}

const DICTIONARIES: Record<Locale, Dictionary> = { en, ar, ku };

export async function getDictionary(): Promise<Dictionary> {
  return DICTIONARIES[await getLocale()];
}
