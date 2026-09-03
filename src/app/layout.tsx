import type { Metadata } from "next";
import { Fredoka } from "next/font/google";
import Script from "next/script";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Header } from "@/components/layout/header";
import { ThemeSync } from "@/components/ui/theme-sync";
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

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Edenic World",
  description: "Edenic World — a learning site for kids.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    /* `suppressHydrationWarning` here only suppresses a mismatch on THIS
       element's own attributes (React docs) — it does not hide a real
       mismatch anywhere else in the tree. It's needed because a browser
       extension can inject its own attributes onto `<html>` before React
       hydrates (seen locally: a `webcrx`/`webcrx-bridged` pair from some
       extension), which React then reports as a mismatch even though
       nothing in this app ever sets them. */
    <html
      lang="en"
      className={`${fredoka.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] sm:pb-0">
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
        <ThemeSync />
        <Header />
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
