import { notFound } from "next/navigation";
import { findPuzzleStage, puzzleStages } from "@/data/puzzles";
import { isUpright } from "@/lib/puzzle-pieces";
import { pageAccent } from "@/components/ui/back-button";
import { PuzzlePlay } from "@/components/activities/puzzle/puzzle-play";

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

  /* A stage with an upright picture has to fit its board AND its heap of loose
     pieces on one phone screen — a child who has to scroll between the two
     cannot drag a piece from one to the other — so it takes back the padding a
     landscape stage, which scrolls anyway, can afford. Read from the same
     `isUpright` the board itself keys off, so the two can never disagree. */
  const upright = isUpright(stage.picture.image);

  return (
    <main
      className={`relative flex flex-1 flex-col ${
        upright ? "pb-2 pt-3 sm:pb-8 sm:pt-5" : "pb-16 pt-5 sm:pb-20"
      }`}
      style={pageAccent("var(--color-go)", "var(--color-go-dark)")}
    >
      {/* The chrome row and the board are one client component: "Help", in
          the hint overlay at the top, places a piece on the board at the
          bottom, and the two have to be able to reach each other. */}
      <PuzzlePlay
        stage={stage.value}
        picture={stage.picture}
        grid={stage.grid}
        nextHref={nextHref}
        upright={upright}
      />
    </main>
  );
}
