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
    <main className="relative flex flex-1 flex-col pb-14 pt-4 sm:pb-20 sm:pt-5">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-8">
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

        {/* Deliberately TIGHT under the chips (`mt-1.5`, not the `mt-4` it
            started at): at any real distance the three pieces read as a
            decoration floating above a heading, and at this one they read as
            the heading's own mark. The page's vertical space belongs to the
            cards — this whole block is as short as it can be while still
            being a hero. */}
        <div
          className="anim-fade-up mt-1.5 text-center sm:mt-2"
          style={{ animationDelay: "0.25s" }}
        >
          <h1 className="text-[1.375rem] font-bold tracking-tight text-[var(--color-ink)] sm:text-3xl">
            Puzzle Time
          </h1>
          <p className="mt-0.5 text-sm text-[var(--color-ink)]/55 sm:mt-1 sm:text-base">
            Complete the puzzles!
          </p>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pb-6 pt-5 sm:px-8 sm:pb-8 sm:pt-8">
        <PuzzleGrid stages={puzzleStages} />
      </div>
    </main>
  );
}
