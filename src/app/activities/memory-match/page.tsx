import type { Metadata } from "next";
import { Heart, Star } from "lucide-react";
import { memoryLevels } from "@/data/memory-levels";
import { BackButton, pageAccent } from "@/components/ui/back-button";
import { MemoryGrid } from "@/components/activities/memory/memory-grid";

export const metadata: Metadata = {
  title: "Memory Match — Edenic World",
  description: "Twelve levels of matching pairs with Pinki, Nova and Bloo.",
};

/**
 * The heading's mark: **a pair, found, with one card still to turn.**
 *
 * The two outer cards are face up showing the same heart and wearing the very
 * same gold rim a matched pair gets on the board; the middle one is still
 * face down, in the game's real card back. So the picture at the top of the
 * page is a hand of Memory Match mid-game rather than a decoration — which is
 * the same job the puzzle page's three interlocking chips do for the puzzles.
 *
 * No character on it, by request. It also can't carry one: the friends appear
 * as CARD FACES from level 10 on, so putting one here would quietly give away
 * one of the pictures the last levels are built on.
 */
const CARDS = [
  { kind: "face", tilt: "-14deg", size: "h-12 w-12 sm:h-14 sm:w-14", delay: 0.15 },
  { kind: "back", tilt: "5deg", size: "h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem]", delay: 0.23 },
  { kind: "face", tilt: "13deg", size: "h-12 w-12 sm:h-14 sm:w-14", delay: 0.31 },
] as const;

export default function MemoryMatchPage() {
  return (
    <main
      className="relative flex flex-1 flex-col pb-16 pt-5 sm:pb-20"
      style={pageAccent(
        "var(--color-gold)",
        "var(--color-gold-dark)",
        "var(--color-ink)",
      )}
    >
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-8">
        {/* Back on the left, the heading's own mark centred on the page —
            centred on the page itself rather than on the space left over,
            which is why the back button is taken out of the flow. */}
        <div
          className="anim-drop-in relative flex items-center justify-center"
          style={{ animationDelay: "0.1s" }}
        >
          {/* The wrapper carries the positioning, not the button: `.btn3d`
              sets `position: relative` and is UNLAYERED, so a Tailwind
              `absolute` utility on the button itself silently loses and it
              stays in the centred flex row. */}
          <span className="absolute left-0 top-0">
            <BackButton href="/activities" label="Back to Activities" />
          </span>

          <span className="flex items-center -space-x-2 sm:-space-x-2.5">
            {CARDS.map(({ kind, tilt, size, delay }, index) => (
              <span
                key={index}
                aria-hidden
                className={`memory-mark anim-pop-in ${
                  kind === "back" ? "memory-mark--back" : "memory-mark--face"
                } ${size}`}
                style={{ rotate: tilt, animationDelay: `${delay}s` }}
              >
                {kind === "back" ? (
                  <Star className="h-1/2 w-1/2 fill-current" strokeWidth={2} />
                ) : (
                  <Heart className="h-1/2 w-1/2 fill-current" strokeWidth={2} />
                )}
              </span>
            ))}
          </span>
        </div>

        <div
          className="anim-fade-up mt-4 text-center sm:mt-5"
          style={{ animationDelay: "0.25s" }}
        >
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-ink)] sm:text-3xl">
            Memory Match
          </h1>
          <p className="mt-1 text-base text-[var(--color-ink)]/60 sm:text-lg">
            Find the matching friends!
          </p>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 py-8 sm:px-8 sm:py-10">
        <MemoryGrid levels={memoryLevels} />
      </div>
    </main>
  );
}
