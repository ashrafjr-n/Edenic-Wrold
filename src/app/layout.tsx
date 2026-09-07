import type { Metadata } from "next";
import { Fredoka, Baloo_Bhaijaan_2, Vazirmatn } from "next/font/google";
import Script from "next/script";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Header } from "@/components/layout/header";
import { PageTransitionOverlay } from "@/components/ui/page-transition-overlay";
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

/* Shared by the page itself and by the share card, so the two can never
   drift apart. */
const SITE_DESCRIPTION =
  "A playful learning world for children under 10 — numbers, letters, colours and games with Pinki, Nova and Bloo.";

/**
 * **Deliberately English in all three locales.** The site's language is a
 * COOKIE (see CLAUDE.md's language-switcher notes), and no unfurler — Slack,
 * WhatsApp, iMessage, a search crawler — sends one, so a translated
 * description here could never actually reach the reader it was for; it would
 * only make the card depend on whichever request happened to warm the cache.
 * The visible site still translates in full.
 *
 * **No `metadataBase`, on purpose.** Next 16 already derives one on Vercel
 * from `VERCEL_PROJECT_PRODUCTION_URL` / `VERCEL_BRANCH_URL` / `VERCEL_URL`
 * (`next/dist/lib/metadata/resolvers/resolve-url.js`), so the share card
 * resolves to an absolute URL on the deployment with zero configuration.
 * Setting one by hand would pin every preview deployment to the production
 * host. Add `metadataBase: new URL("https://<domain>")` here the day a custom
 * domain lands, and nothing else changes.
 *
 * The card itself is a file, not code: `opengraph-image.jpg` /
 * `twitter-image.jpg` beside this file, with their `.alt.txt` companions.
 * Next finds them by convention and writes every `og:image*` /
 * `twitter:image*` tag from them, including the real pixel dimensions —
 * which is the part unfurlers need in order to render a large card at all.
 */
export const metadata: Metadata = {
  title: {
    default: "Edenic World — Learn. Play. Grow.",
    /* A sub-page that sets its own `title` gets it branded automatically;
       none does yet, and this is what makes that free when one does. */
    template: "%s — Edenic World",
  },
  description: SITE_DESCRIPTION,
  applicationName: "Edenic World",
  openGraph: {
    type: "website",
    siteName: "Edenic World",
    title: "Edenic World — Learn. Play. Grow.",
    description: SITE_DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    /* The big-picture card rather than the thumbnail one — the whole point
       of drawing a 1200x630 scene. */
    card: "summary_large_image",
    title: "Edenic World — Learn. Play. Grow.",
    description: SITE_DESCRIPTION,
  },
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
      className={`${fredoka.variable} ${balooBhaijaan.variable} ${vazirmatn.variable} antialiased`}
      suppressHydrationWarning
    >
      {/* **`min-h-[100svh]`, and NOT `min-h-full` on an `h-full` `<html>`.**
          That percentage pair was the site's one remaining dependency on the
          DYNAMIC viewport: a percentage height resolves against the initial
          containing block, which Chrome on Android re-sizes as its address
          bar slides away, so `body` — and every `<main className="flex-1">`
          in it — grew by the height of that bar mid-scroll. Measured at
          390x844 against 390x926: `body` and `main` both gained exactly
          82px, and every centred page shifted its content 41px with them
          (the puzzle board, the trail's back button, the numbers grid).
          `svh` is the SMALL viewport — the height that is there with the bar
          showing — so it is the one value that never re-measures, which is
          what the site's viewport-unit rule asks a LAYOUT box for. `100%` is
          effectively `dvh` here, which that rule uses nowhere.

          `<html>` keeps no height of its own now: it existed only to give
          this percentage something to resolve against, and `body`'s
          background still propagates to the canvas either way. */}
      <body className="flex min-h-[100svh] flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] sm:pb-0">
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
        <ThemeSync />
        <PageTransitionOverlay />
        <Header dict={dict} locale={locale} />
        {children}
        <BottomNav dict={dict} />
      </body>
    </html>
  );
}
