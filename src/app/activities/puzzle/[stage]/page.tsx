import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { findPuzzleStage, puzzleStages } from "@/data/puzzles";
import { Button3D } from "@/components/ui/button-3d";
import { PuzzleBoard } from "@/components/activities/puzzle/puzzle-board";
import { PuzzleView } from "@/components/activities/puzzle/puzzle-view";

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
  if (!stage?.picture || !stage.grid) notFound();

  /* Where "Next" goes when the picture is finished: the following stage if it
     is actually playable, otherwise back to the list — the same call the
     numbers journey makes at the end of its own run. */
  const index = puzzleStages.indexOf(stage);
  const next = puzzleStages[index + 1];
  const nextHref = next?.picture
    ? `/activities/puzzle/${next.value}`
    : "/activities/puzzle";

  return (
    <main className="relative flex flex-1 flex-col pb-16 pt-5 sm:pb-20">
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-8">
        {/* Back sits on the left, `View` dead centre of the page — centred on
            the page rather than on the space left over, which is why the back
            button is taken out of the flow rather than balanced by a spacer. */}
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
          </span>

          <PuzzleView picture={stage.picture} />
        </div>
      </div>

      <div className="mx-auto flex w-full flex-1 flex-col justify-center px-4 py-8 sm:px-8 sm:py-10">
        <PuzzleBoard
          stage={stage.value}
          picture={stage.picture}
          grid={stage.grid}
          nextHref={nextHref}
        />
      </div>
    </main>
  );
}
