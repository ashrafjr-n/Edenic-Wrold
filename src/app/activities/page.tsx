import type { Metadata } from "next";
import { PuzzleCta } from "@/components/activities/puzzle-cta";
import { MemoryMatchCta } from "@/components/activities/memory-match-cta";
import { WatchLearnCta } from "@/components/activities/watch-learn-cta";

export const metadata: Metadata = {
  title: "Activities — Edenic World",
  description: "Fun videos and hands-on activities for kids at Edenic World.",
};

/**
 * The Activities page: cards only, no heading/intro copy, by request.
 *
 * **Three cards on one recipe, in a regular grid** — one per row on a phone,
 * three across from `lg`. It was two stacked cards plus `MascotYoutubeCta`, a
 * small `fixed` widget floating in the bottom-right corner of the viewport;
 * that widget is gone (see `WatchLearnCta`), and the odd empty space it used
 * to sit in went with it, because the page is now a complete grid rather than
 * two cards and a gap.
 */
export default function ActivitiesPage() {
  return (
    <main className="flex flex-1 flex-col px-4 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto grid w-full max-w-7xl gap-6 sm:gap-8 lg:grid-cols-3">
        <PuzzleCta />

        <MemoryMatchCta />

        <WatchLearnCta />
      </div>
    </main>
  );
}
