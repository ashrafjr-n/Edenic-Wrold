import type { Metadata } from "next";
import { Brain } from "lucide-react";
import { memoryLevels } from "@/data/memory-levels";
import { BackButton, pageAccent } from "@/components/ui/back-button";
import {
  HeadingMark,
  HEADING_CHIP_SHAPE,
  type HeadingChip,
} from "@/components/ui/heading-mark";
import { MemoryGrid } from "@/components/activities/memory/memory-grid";

export const metadata: Metadata = {
  title: "Memory Match — Edenic World",
  description: "Twelve levels of matching pairs with Pinki, Nova and Bloo.",
};

/**
 * The heading's mark: **the puzzles' three chips exactly, in one gold, with
 * one repeated icon.**
 *
 * It used to be a hand of the game — a matched PAIR (two hearts) either side
 * of one card still face down (a star), each in its own treatment. That was
 * cut on direct request for the right reason: heart, star, heart does not
 * read as "memory" to anyone, and varying the icon across the three chips
 * turned the mark into decoration. One symbol repeated three times names a
 * subject; three different symbols name nothing.
 *
 * The `Brain` is the same icon the Activities card's own button carries, so
 * the game is marked the same way on the page that leads here and on the page
 * itself. No character on it, by request — and it could not carry one anyway:
 * the friends are card FACES from level 10 on, so a mascot here would give
 * away one of the pictures the last levels are built on.
 */
const CHIPS: HeadingChip[] = HEADING_CHIP_SHAPE.map((shape) => ({
  ...shape,
  face: "var(--color-gold)",
  edge: "var(--color-gold-dark)",
}));

export default function MemoryMatchPage() {
  return (
    <main
      className="relative flex flex-1 flex-col pb-16 pt-5 sm:pb-20"
      style={pageAccent(
        "var(--color-gold)",
        "var(--color-gold-dark)",
        /* --color-ink-fixed, not --color-ink: gold is unaffected by theme, so its ink has to stay unaffected too. */
        "var(--color-ink-fixed)",
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

          {/* Ink, not white: gold is the one face on the site pale enough
              that a white icon disappears on it — the same call this game's
              CTA button and the puzzle hint chip's lightbulb make. */}
          {/* --color-ink-fixed, not --color-ink: the chips are gold, unaffected
              by theme, so the icon on them has to stay unaffected too. */}
          <HeadingMark chips={CHIPS} icon={Brain} ink="var(--color-ink-fixed)" />
        </div>

        <div
          className="anim-fade-up mt-4 text-center sm:mt-5"
          style={{ animationDelay: "0.25s" }}
        >
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-ink)] sm:text-3xl">
            Memory Match
          </h1>
          {/* A step down from the `h1` in size AND weight — the line telling
              a child what the page is for, not a second heading. */}
          <p className="mt-1.5 text-sm font-medium text-[var(--color-ink)]/55 sm:text-base">
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
