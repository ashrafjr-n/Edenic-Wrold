import type { Metadata } from "next";
import { PuzzleCta } from "@/components/activities/puzzle-cta";
import { MemoryMatchCta } from "@/components/activities/memory-match-cta";

export const metadata: Metadata = {
  title: "Activities — Edenic World",
  description: "Fun videos and hands-on activities for kids at Edenic World.",
};

const ITEM_DELAY = 0.1;
const ITEM_STAGGER = 0.12;

/**
 * The Activities page: cards only, no heading/intro copy, by request.
 *
 * **Two cards on one recipe, in a regular grid** — one per row on a phone,
 * side by side from `lg`. It carried a third, `WatchLearnCta` (a link out to
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
export default function ActivitiesPage() {
  return (
    <main className="flex flex-1 flex-col justify-center px-4 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto grid w-full max-w-5xl gap-6 sm:gap-8 lg:grid-cols-2">
        <PuzzleCta
          className="anim-rise-in"
          style={{ animationDelay: `${ITEM_DELAY}s` }}
        />

        <MemoryMatchCta
          className="anim-rise-in"
          style={{ animationDelay: `${ITEM_DELAY + ITEM_STAGGER}s` }}
        />
      </div>
    </main>
  );
}
