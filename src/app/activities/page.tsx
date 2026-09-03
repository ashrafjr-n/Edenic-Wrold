import type { Metadata } from "next";
import { PuzzleCta } from "@/components/activities/puzzle-cta";
import { MemoryMatchCta } from "@/components/activities/memory-match-cta";

export const metadata: Metadata = {
  title: "Activities — Edenic World",
  description: "Fun videos and hands-on activities for kids at Edenic World.",
};

/**
 * The Activities page: cards only, no heading/intro copy, by request.
 *
 * **Two cards on one recipe, in a regular grid** — one per row on a phone,
 * side by side from `lg`. It carried a third, `WatchLearnCta` (a link out to
 * the YouTube channel), which was cut on direct request: the page is the two
 * games a child can actually play here, and a card that leaves the site
 * belongs with the other social links rather than beside them.
 */
export default function ActivitiesPage() {
  return (
    <main className="flex flex-1 flex-col justify-center px-4 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto grid w-full max-w-5xl gap-6 sm:gap-8 lg:grid-cols-2">
        <PuzzleCta />

        <MemoryMatchCta />
      </div>
    </main>
  );
}
