import type { Metadata } from "next";
import { Puzzle } from "lucide-react";
import { puzzleStages } from "@/data/puzzles";
import { BackButton, pageAccent } from "@/components/ui/back-button";
import {
  HeadingMark,
  HEADING_CHIP_SHAPE,
  type HeadingChip,
} from "@/components/ui/heading-mark";
import { PuzzleGrid } from "@/components/activities/puzzle/puzzle-grid";

export const metadata: Metadata = {
  title: "Puzzles — Edenic World",
  description: "Fifteen picture puzzles to build, one piece at a time.",
};

/** Three clay puzzle chips instead of a word — one per friend's colour, so
    the mark is the three of them holding a piece each. Shape comes from
    `HEADING_CHIP_SHAPE`, shared with Memory Match's mark. */
const CHIPS: HeadingChip[] = [
  { face: "var(--color-pinki)", edge: "var(--color-pinki-dark)" },
  { face: "var(--color-gold)", edge: "var(--color-gold-dark)" },
  { face: "var(--color-bloo)", edge: "var(--color-bloo-dark)" },
].map((tone, index) => ({ ...tone, ...HEADING_CHIP_SHAPE[index] }));

export default function PuzzleStagesPage() {
  return (
    <main
      className="relative flex flex-1 flex-col pb-16 pt-5 sm:pb-20"
      style={pageAccent("var(--color-go)", "var(--color-go-dark)")}
    >
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-8">
        {/* Back on the left, the puzzle chips centred on the page — centred
            on the page itself rather than on the space left over, which is
            why the back button is taken out of the flow. */}
        <div
          className="anim-drop-in relative flex items-center justify-center"
          style={{ animationDelay: "0.1s" }}
        >
          {/* The wrapper carries the positioning, not the button:
              `.btn3d` sets `position: relative` and is UNLAYERED, so a
              Tailwind `absolute` utility on the button itself silently
              loses and it stays in the centred flex row. */}
          <span className="absolute left-0 top-0">
            <BackButton href="/activities" label="Back to Activities" />
          </span>

          <HeadingMark chips={CHIPS} icon={Puzzle} />
        </div>

        {/* The chips alone said "puzzles" without saying what the page is for.
            The title and the line under it give the fifteen cards a heading to
            sit beneath — the chips stay as the picture of it. */}
        <div
          className="anim-fade-up mt-4 text-center sm:mt-5"
          style={{ animationDelay: "0.25s" }}
        >
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-ink)] sm:text-3xl">
            Puzzle Time
          </h1>
          {/* Deliberately a step down from the `h1` in BOTH size and weight —
              it is the one line telling a child what the page is for, not a
              second heading. At `text-base sm:text-lg` it sat close enough to
              the title that the whole head read as heavy. */}
          <p className="mt-1.5 text-sm font-medium text-[var(--color-ink)]/55 sm:text-base">
            Complete the puzzles!
          </p>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 py-8 sm:px-8 sm:py-10">
        <PuzzleGrid stages={puzzleStages} />
      </div>
    </main>
  );
}
