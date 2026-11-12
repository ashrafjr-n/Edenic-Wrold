import type { Metadata } from "next";
import { PuzzleCta } from "@/components/activities/puzzle-cta";
import { MemoryMatchCta } from "@/components/activities/memory-match-cta";
import { CupsCta } from "@/components/activities/cups-cta";
import { BackRow } from "@/components/ui/back-button";
import { getDictionary } from "@/lib/locale";

export const metadata: Metadata = {
  title: "Games — Edenic World",
  description: "Puzzles, memory and cups games for kids at Edenic World.",
};

const ITEM_DELAY = 0.1;
const ITEM_STAGGER = 0.12;

/**
 * Free play (2026-11-12): the three games on their own, cards only, no
 * heading or copy — what `/play` was until the Sky Trail took that page.
 * The sky plays these same games as its levels' challenges; here a child
 * picks one and its level freely.
 *
 * The cards rise in, staggered (`anim-rise-in`), wider apart than the
 * fifteen-card grids' `0.06s` so it reads as one-then-the-other.
 */
export default async function GamesPage() {
  const dict = await getDictionary();

  return (
    <main className="flex flex-1 flex-col overflow-x-clip">
      <BackRow href="/play" label={dict.sky.back} />
      <div className="flex flex-1 flex-col justify-center px-4 pb-10 pt-6 sm:px-8 sm:pb-14">
        <div className="mx-auto grid w-full max-w-5xl gap-6 sm:gap-8 lg:max-w-6xl lg:grid-cols-3">
          <PuzzleCta dict={dict} className="anim-rise-in" style={{ animationDelay: `${ITEM_DELAY}s` }} />
          <MemoryMatchCta dict={dict} className="anim-rise-in" style={{ animationDelay: `${ITEM_DELAY + ITEM_STAGGER}s` }} />
          <CupsCta dict={dict} className="anim-rise-in" style={{ animationDelay: `${ITEM_DELAY + ITEM_STAGGER * 2}s` }} />
        </div>
      </div>
    </main>
  );
}
