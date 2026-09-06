import type { Metadata } from "next";
import { PuzzleCta } from "@/components/activities/puzzle-cta";
import { MemoryMatchCta } from "@/components/activities/memory-match-cta";
import { FriendWorldTeaser } from "@/components/activities/friend-world-teaser";
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
 * **Two cards on one recipe, in a regular grid** — one per row on a phone,
 * side by side from `lg` — and beneath them one full-width teaser card for
 * the friend-world feature, which is not built and not navigable. It carried a third, `WatchLearnCta` (a link out to
 * the YouTube channel), which was cut on direct request: the page is the two
 * games a child can actually play here, and a card that leaves the site
 * belongs with the other social links rather than beside them.
 *
 * **Both cards rise in, staggered — `PuzzleGrid` / `MemoryGrid`'s own
 * timing** (`anim-rise-in`, `ITEM_DELAY + index * ITEM_STAGGER`). This page
 * was the one grid of cards on the site with no entrance choreography at
 * all — everywhere else (the stage grid, the level grid, the lesson hub, the
 * home page) fades or rises its content in on load, and landing here felt
 * like the page had frozen mid-render by comparison. `ITEM_STAGGER` is
 * wider than the fifteen-card grids' `0.06s` on purpose: two cards need a
 * pause long enough to actually read as one-then-the-other rather than a
 * near-simultaneous flicker.
 */
export default async function ActivitiesPage() {
  const dict = await getDictionary();

  return (
    <main className="flex flex-1 flex-col justify-center px-4 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto grid w-full max-w-5xl gap-6 sm:gap-8 lg:grid-cols-2">
        <PuzzleCta
          dict={dict}
          className="anim-rise-in"
          style={{ animationDelay: `${ITEM_DELAY}s` }}
        />

        <MemoryMatchCta
          dict={dict}
          className="anim-rise-in"
          style={{ animationDelay: `${ITEM_DELAY + ITEM_STAGGER}s` }}
        />

        {/* Spans both columns beneath the pair — it is a teaser for a whole
            feature, not a third game, and sitting in the same grid at twice
            the width is what says so. Last in the stagger, so the two
            playable cards arrive before the one that cannot be played. */}
        <FriendWorldTeaser
          dict={dict}
          className="anim-rise-in lg:col-span-2"
          style={{ animationDelay: `${ITEM_DELAY + ITEM_STAGGER * 2}s` }}
        />
      </div>
    </main>
  );
}
