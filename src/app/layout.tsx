import type { Metadata } from "next";
import { Fredoka } from "next/font/google";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Header } from "@/components/layout/header";
import "./globals.css";

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
        <Header />
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
