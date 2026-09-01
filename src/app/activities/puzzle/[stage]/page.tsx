import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { findPuzzleStage, puzzleStages } from "@/data/puzzles";
import { Button3D } from "@/components/ui/button-3d";
import { PuzzleBoard } from "@/components/activities/puzzle/puzzle-board";

export function generateStaticParams() {
  return puzzleStages
    .filter((stage) => stage.picture)
    .map((stage) => ({ stage: String(stage.value) }));
}

interface PuzzleStagePageProps {
  params: Promise<{ stage: string }>;
}

export default async function PuzzleStagePage({
  params,
}: PuzzleStagePageProps) {
  const { stage: stageId } = await params;
  const stage = findPuzzleStage(Number(stageId));

  /* Which stages are open lives in the progress store, which is client-side,
     so this route cannot gate on it — the lock is drawn on the grid instead.
     A stage with no picture has nothing to play, and that IS a 404. */
  if (!stage?.picture) notFound();

  return (
    <main className="relative flex flex-1 flex-col pb-16 pt-5 sm:pb-20">
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-8">
        <div
          className="anim-drop-in flex items-center gap-3"
          style={{ animationDelay: "0.1s" }}
        >
          <Button3D
            variant="calm"
            tone={{ face: "var(--surface)" }}
            href="/activities/puzzle"
            aria-label="Back to the puzzles"
            className="btn3d--clay-white h-12 w-12 shrink-0 sm:h-14 sm:w-14"
          >
            <ArrowLeft
              className="h-5 w-5 text-[var(--color-ink-soft)] sm:h-6 sm:w-6"
              strokeWidth={2.75}
            />
          </Button3D>

          <span className="card card-pill px-5 py-2.5 text-sm font-bold text-[var(--color-ink)] sm:px-6 sm:py-3 sm:text-base">
            Puzzle {stage.value}
          </span>
        </div>
      </div>

      <div className="mx-auto flex w-full flex-1 flex-col justify-center px-4 py-8 sm:px-8 sm:py-10">
        <PuzzleBoard stage={stage.value} picture={stage.picture} />
      </div>
    </main>
  );
}
