import type { Metadata } from "next";
import { Fredoka, Baloo_Bhaijaan_2, Vazirmatn } from "next/font/google";
import Script from "next/script";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Header } from "@/components/layout/header";
import { ThemeSync } from "@/components/ui/theme-sync";
import { getDictionary, getLocale } from "@/lib/locale";
import "./globals.css";

/* Runs before hydration (`beforeInteractive`) so `<html>` already carries
   the right `data-theme` on the very first paint — without it, a returning
   visitor with dark mode saved would see a flash of the light theme before
   `ThemeSync`'s effect could catch up. Reads the same `localStorage` key
   `store/theme.ts` persists to and mirrors its JSON shape by hand, since a
   `beforeInteractive` script runs standalone, before any app code
   (zustand included) has loaded. Wrapped in `try/catch`: private
   browsing / storage disabled must fall back to light, never throw. */
const THEME_INIT_SCRIPT = `
  try {
    var raw = localStorage.getItem("edenic-theme");
    var theme = raw ? JSON.parse(raw).state.theme : "light";
    if (theme === "dark") document.documentElement.dataset.theme = "dark";
  } catch (e) {}
`;

/* `--font-fredoka` does NOT expand to just "Fredoka". next/font emits a
   metric-matched fallback face alongside it — `@font-face { font-family:
   Fredoka Fallback; src: local(Arial) }` — and puts it inside the variable,
   so the value is `"Fredoka", "Fredoka Fallback"`.

   That matters here because **Arial has full Arabic coverage**. Written the
   obvious way, `font-family: var(--font-fredoka), var(--font-rtl)` expands to
   `Fredoka, "Fredoka Fallback", <arabic face>`, and every Arabic and Kurdish
   character is served by Arial before the stack ever reaches the face chosen
   for it. Measured with `CSS.getPlatformFontsForNode`: the Arabic site had
   been rendering in Arial the whole time and Baloo Bhaijaan 2's faces never
   left `unloaded`. `globals.css` fixes it by naming `Fredoka` itself first
   and keeping `var(--font-fredoka)` further down for its fallback metrics —
   see the `body` rule there.

   `adjustFontFallback: false` is NOT the fix and is deliberately not used:
   Next 16.3.3 still emits the `local(Arial)` face and its metric overrides
   with the option set, so it silently changes nothing. */
const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
});

/* Fredoka has no Arabic glyphs (subsets: hebrew, latin, latin-ext only) — this
   fills in for Arabic text. `globals.css`'s `--font-sans` lists both, so the
   browser picks per-character: Latin content keeps rendering in Fredoka and
   only Arabic runs fall back to this one. */
const balooBhaijaan = Baloo_Bhaijaan_2({
  variable: "--font-baloo",
  /* `arabic` only: Latin is Fredoka's job in every locale, and a Latin
     subset here would sit ahead of Fredoka's own fallback in the stack and
     render Latin text in Baloo for the moment before Fredoka loads. */
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700", "800"],
});

/* Badini Kurdish, and ONLY Badini Kurdish. Baloo Bhaijaan 2 is the better
   match for this site — rounded and playful next to Fredoka — but its file
   has no glyph for ڕ ڵ ێ ۆ, four of the commonest letters in the Kurdish
   alphabet (checked against the font's own cmap, not by eye). Without a face
   that covers them, a Kurdish page renders most of a word in Baloo and those
   four letters in whatever the OS happens to have, which is a different
   typeface mid-word. Vazirmatn covers the whole Kurdish-Arabic alphabet and
   is the closest of the fully-covering families to this site's feel — the
   others (Noto Kufi/Naskh Arabic, Scheherazade New, Reem Kufi) are kufi or
   bookish naskh. Arabic keeps Baloo; `globals.css` swaps between them on
   `html[lang]`, so neither locale pays for the other's font. */
const vazirmatn = Vazirmatn({
  variable: "--font-kurdish",
  subsets: ["arabic"],
});

export const metadata: Metadata = {
  title: "Edenic World",
  description: "Edenic World — a learning site for kids.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  const dict = await getDictionary();

  return (
    /* `suppressHydrationWarning` here only suppresses a mismatch on THIS
       element's own attributes (React docs) — it does not hide a real
       mismatch anywhere else in the tree. It's needed because a browser
       extension can inject its own attributes onto `<html>` before React
       hydrates (seen locally: a `webcrx`/`webcrx-bridged` pair from some
       extension), which React then reports as a mismatch even though
       nothing in this app ever sets them.

       `lang` follows the locale for accessibility/pronunciation; `dir` is
       deliberately NOT set — every layout on the site stays left-to-right
       in both languages, only the words themselves change (see CLAUDE.md's
       language switcher conventions). */
    <html
      lang={locale}
      className={`${fredoka.variable} ${balooBhaijaan.variable} ${vazirmatn.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] sm:pb-0">
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
        <ThemeSync />
        <Header dict={dict} locale={locale} />
        {children}
        <BottomNav dict={dict} />
      </body>
    </html>
  );
}
