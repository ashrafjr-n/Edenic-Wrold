import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { ArrowLeft, Puzzle } from "lucide-react";
import { puzzleStages } from "@/data/puzzles";
import { Button3D } from "@/components/ui/button-3d";
import { PuzzleGrid } from "@/components/activities/puzzle/puzzle-grid";

export const metadata: Metadata = {
  title: "Puzzles — Edenic World",
  description: "Fifteen picture puzzles to build, one piece at a time.",
};

type ClayVars = CSSProperties & { "--clay-edge"?: string };

/** Three clay puzzle chips instead of a word. They lean into each other like
    pieces waiting to be joined, and they're the same material as the cards
    below — the heading of this page is a picture, not a label. */
const CHIPS: { tone: ClayVars; tilt: string; size: string }[] = [
  {
    tone: {
      backgroundColor: "var(--color-pinki)",
      "--clay-edge": "var(--color-pinki-dark)",
    },
    tilt: "-12deg",
    size: "h-11 w-11 sm:h-12 sm:w-12",
  },
  {
    tone: {
      backgroundColor: "var(--color-gold)",
      "--clay-edge": "var(--color-gold-dark)",
    },
    tilt: "6deg",
    size: "h-14 w-14 sm:h-16 sm:w-16",
  },
  {
    tone: {
      backgroundColor: "var(--color-bloo)",
      "--clay-edge": "var(--color-bloo-dark)",
    },
    tilt: "14deg",
    size: "h-11 w-11 sm:h-12 sm:w-12",
  },
];

export default function PuzzleStagesPage() {
  return (
    <main className="relative flex flex-1 flex-col pb-16 pt-5 sm:pb-20">
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
            <Button3D
              tone={{ face: "var(--accent)", edge: "var(--accent-dark)" }}
              href="/activities"
              aria-label="Back to Activities"
              className="h-12 w-12 shrink-0 sm:h-14 sm:w-14"
            >
              <ArrowLeft
                className="h-5 w-5 text-white sm:h-6 sm:w-6"
                strokeWidth={2.75}
              />
            </Button3D>
          </span>

          <span className="flex items-center -space-x-2 sm:-space-x-2.5">
            {CHIPS.map(({ tone, tilt, size }, index) => (
              <span
                key={index}
                aria-hidden
                className={`clay anim-pop-in flex items-center justify-center rounded-2xl ${size}`}
                style={{
                  ...tone,
                  rotate: tilt,
                  animationDelay: `${0.15 + index * 0.08}s`,
                }}
              >
                <Puzzle
                  className="h-1/2 w-1/2 fill-current text-white"
                  strokeWidth={2}
                />
              </span>
            ))}
          </span>
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
          <p className="mt-1 text-base text-[var(--color-ink)]/60 sm:text-lg">
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
