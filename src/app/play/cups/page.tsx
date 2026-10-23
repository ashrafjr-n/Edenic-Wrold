import type { Metadata } from "next";
import { pageAccent } from "@/components/ui/back-button";
import { CupsPlay } from "@/components/activities/cups/cups-play";
import { getDictionary } from "@/lib/locale";

export const metadata: Metadata = {
  title: "Nova's Cups — Edenic World",
  description: "Watch Nova's cups and find the vegetable — a game for kids at Edenic World.",
};

/** Nova's Cups — the game, in Nova's lavender (her back button, her badge).
    The level lives in the progress store (client-side), so the whole screen
    is `CupsPlay`. */
export default async function CupsPage() {
  const dict = await getDictionary();
  return (
    <main
      className="relative flex flex-1 flex-col overflow-x-clip"
      style={pageAccent("var(--color-nova)", "var(--color-nova-dark)", "#fff")}
    >
      <CupsPlay dict={dict} />
    </main>
  );
}
