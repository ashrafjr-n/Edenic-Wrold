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

/** The title's own mark: ONE clay puzzle piece, sitting beside the words
    rather than above them. It was three chips leaning into each other on a
    line of their own — a nice object, but it stacked icon → title → subtitle
    → journey label → bar before a single stage was on screen, and this page's
    vertical space belongs to the tiles. Same material either way. */
const ICON_TONE: ClayVars = {
  backgroundColor: "var(--color-gold)",
  "--clay-edge": "var(--color-gold-dark)",
};

export default function PuzzleStagesPage() {
  return (
    <main className="relative flex flex-1 flex-col pb-14 pt-4 sm:pb-20 sm:pt-5">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-8">
        {/* Back on the left, the title lockup centred on the page — centred
            on the page itself rather than on the space left over, which is
            why the back button is taken out of the flow. The lockup's phone
            sizes are held down deliberately: at 320px wide the centred group
            has to clear the absolutely positioned back button. */}
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

          <span className="flex items-center gap-2.5 sm:gap-4">
            <span
              aria-hidden
              className="clay anim-pop-in flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl sm:h-14 sm:w-14"
              style={{ ...ICON_TONE, animationDelay: "0.18s" }}
            >
              <Puzzle
                className="h-1/2 w-1/2 fill-current text-white"
                strokeWidth={2}
              />
            </span>

            <span className="text-left">
              <h1 className="text-xl font-bold tracking-tight text-[var(--color-ink)] sm:text-3xl">
                Puzzle Time
              </h1>
              <p className="text-xs text-[var(--color-ink)]/55 sm:text-base">
                Complete the puzzles!
              </p>
            </span>
          </span>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pb-6 pt-4 sm:px-8 sm:pb-8 sm:pt-6">
        <PuzzleGrid stages={puzzleStages} />
      </div>
    </main>
  );
}
