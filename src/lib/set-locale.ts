"use server";

import { cookies } from "next/headers";
import { LOCALE_COOKIE, type Locale } from "@/types/locale";

/** One year — long enough that a returning child keeps their language. */
const MAX_AGE = 60 * 60 * 24 * 365;

export async function setLocale(locale: Locale) {
  const store = await cookies();
  store.set(LOCALE_COOKIE, locale, { path: "/", maxAge: MAX_AGE });
}
