import type { Metadata } from "next";
import { PuzzleCta } from "@/components/activities/puzzle-cta";
import { MemoryMatchCta } from "@/components/activities/memory-match-cta";
import { TrailCta } from "@/components/activities/trail-cta";
import { getDictionary } from "@/lib/locale";

export const metadata: Metadata = {
  title: "Play — Edenic World",
  description: "Puzzles and memory games for kids at Edenic World.",
};

const ITEM_DELAY = 0.1;
const ITEM_STAGGER = 0.12;

/**
 * The Activities page: cards only, no heading/intro copy, by request.
 *
 * **The Edenic Trail card leads the page, full-width, with the two playable
 * games below it.** It replaced `FriendWorldTeaser`, the friend-world
 * "Coming Soon" placeholder that used to hold this slot (and which had
 * itself been moved from last to first). It carried a third card, `WatchLearnCta`
 * (a link out to the YouTube channel), which was cut on direct request: the
 * page is the two games a child can actually play here, and a card that
 * leaves the site belongs with the other social links rather than beside
 * them.
 *
 * **All three cards rise in, staggered — `PuzzleGrid` / `MemoryGrid`'s own
 * timing** (`anim-rise-in`, `ITEM_DELAY + index * ITEM_STAGGER`). This page
 * was the one grid of cards on the site with no entrance choreography at
 * all — everywhere else (the stage grid, the level grid, the lesson hub, the
 * home page) fades or rises its content in on load, and landing here felt
 * like the page had frozen mid-render by comparison. `ITEM_STAGGER` is
 * wider than the fifteen-card grids' `0.06s` on purpose: a pause long enough
 * to actually read as one-then-the-other rather than a near-simultaneous
 * flicker.
 */
export default async function ActivitiesPage() {
  const dict = await getDictionary();

  return (
    <main className="flex flex-1 flex-col justify-center px-4 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto grid w-full max-w-5xl gap-6 sm:gap-8 lg:grid-cols-2">
        {/* Spans both columns, first in the grid — the Trail is a section
            of the site, not a third game, and leading the page at twice the
            width is what says so. */}
        <TrailCta
          dict={dict}
          className="anim-rise-in lg:col-span-2"
          style={{ animationDelay: `${ITEM_DELAY}s` }}
        />

        <PuzzleCta
          dict={dict}
          className="anim-rise-in"
          style={{ animationDelay: `${ITEM_DELAY + ITEM_STAGGER}s` }}
        />

        <MemoryMatchCta
          dict={dict}
          className="anim-rise-in"
          style={{ animationDelay: `${ITEM_DELAY + ITEM_STAGGER * 2}s` }}
        />
      </div>
    </main>
  );
}
