import "server-only";
import { cookies } from "next/headers";
import { LOCALE_COOKIE, type Locale } from "@/types/locale";
import { en } from "./dictionaries/en";
import { ar } from "./dictionaries/ar";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  return store.get(LOCALE_COOKIE)?.value === "ar" ? "ar" : "en";
}

export async function getDictionary() {
  const locale = await getLocale();
  return locale === "ar" ? ar : en;
}
