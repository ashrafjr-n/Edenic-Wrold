import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { puzzleStages } from "@/data/puzzles";
import { Button3D } from "@/components/ui/button-3d";
import { PuzzleGrid } from "@/components/activities/puzzle/puzzle-grid";

export const metadata: Metadata = {
  title: "Puzzles — Edenic World",
  description: "Nine picture puzzles to build, one piece at a time.",
};

export default function PuzzleStagesPage() {
  return (
    <main className="relative flex flex-1 flex-col pb-16 pt-5 sm:pb-20">
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-8">
        {/* Same back/chip row as the lesson routes — the back button is the
            only chrome an activity needs. */}
        <div
          className="anim-drop-in flex items-center gap-3"
          style={{ animationDelay: "0.1s" }}
        >
          <Button3D
            variant="calm"
            tone={{ face: "var(--surface)" }}
            href="/activities"
            aria-label="Back to Activities"
            className="btn3d--clay-white h-12 w-12 shrink-0 sm:h-14 sm:w-14"
          >
            <ArrowLeft
              className="h-5 w-5 text-[var(--color-ink-soft)] sm:h-6 sm:w-6"
              strokeWidth={2.75}
            />
          </Button3D>

          <span className="card card-pill px-5 py-2.5 text-sm font-bold text-[var(--color-ink)] sm:px-6 sm:py-3 sm:text-base">
            Puzzles
          </span>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 py-8 sm:px-8 sm:py-10">
        <PuzzleGrid stages={puzzleStages} />
      </div>
    </main>
  );
}
