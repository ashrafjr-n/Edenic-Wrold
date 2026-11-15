import type { Metadata } from "next";
import { PuzzleCta } from "@/components/activities/puzzle-cta";
import { MemoryMatchCta } from "@/components/activities/memory-match-cta";
import { CupsCta } from "@/components/activities/cups-cta";
import { BackRow } from "@/components/ui/back-button";
import { getDictionary } from "@/lib/locale";

export const metadata: Metadata = {
  title: "Play — Edenic World",
  description: "Puzzles, memory and cups games for kids at Edenic World.",
};

const ITEM_DELAY = 0.1;
const ITEM_STAGGER = 0.12;

/**
 * Play, for now: the three games, cards only, no heading or copy. The Sky
 * Trail that stood here was cancelled (2026-11-15); its successor, "The
 * Sleeping Lab" (`edenic-plan.md`), will take this page and move these cards
 * behind a button of their own.
 *
 * The cards rise in, staggered (`anim-rise-in`), wider apart than the
 * fifteen-card grids' `0.06s` so it reads as one-then-the-other.
 */
export default async function PlayPage() {
  const dict = await getDictionary();

  return (
    <main className="flex flex-1 flex-col overflow-x-clip">
      <BackRow href="/discover" label={dict.discover.backToDiscover} />
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
