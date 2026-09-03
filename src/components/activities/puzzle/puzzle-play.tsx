"use client";

import { useRef, useState } from "react";
import type { PuzzleGrid, PuzzlePicture } from "@/types/puzzle";
import { BackButton } from "@/components/ui/back-button";
import { LevelBadge } from "@/components/ui/level-badge";
import { PuzzleHint } from "@/components/activities/puzzle/puzzle-hint";
import {
  PuzzleBoard,
  type PuzzleBoardHandle,
} from "@/components/activities/puzzle/puzzle-board";

interface PuzzlePlayProps {
  stage: number;
  picture: PuzzlePicture;
  grid: PuzzleGrid;
  nextHref: string;
  /** Whether this stage's picture is square or taller, which changes how much
      padding the two rows can afford. Resolved by the route from the same
      `isUpright` the board keys off, so the two can never disagree. */
  upright: boolean;
}

/** Presses of "Help" a child gets per stage. Not persisted: it is per stage
    as asked, and a stage is one sitting. */
const HELP_LIMIT = 3;

/**
 * One puzzle screen: the chrome row (back, and the hint chip opposite it) and
 * the board under it.
 *
 * It exists because "Help" lives in the hint overlay at the top of the page
 * but acts on the board at the bottom of it — two client leaves that would
 * otherwise have no way to reach each other. Holding the count here and
 * calling the board's `solveOne` through a ref keeps the whole thing to one
 * event handler, with no signal prop watched by an effect and no store for
 * what is really just this screen's own state.
 */
export function PuzzlePlay({
  stage,
  picture,
  grid,
  nextHref,
  upright,
}: PuzzlePlayProps) {
  const board = useRef<PuzzleBoardHandle>(null);
  const [helpsLeft, setHelpsLeft] = useState(HELP_LIMIT);

  /* Only spend a press that actually placed something: the board says no when
     the picture is already finished or a piece is still in the air. */
  const help = () => {
    if (helpsLeft <= 0) return;
    if (board.current?.solveOne()) setHelpsLeft((left) => left - 1);
  };

  return (
    <>
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-8">
        {/* Back on the left; on the right, which stage this is and then the
            hint chip. All three are the same size — one row of chrome, the
            way the lesson pages pair their back button with the achievements
            crown. The stage number rides beside the hint rather than sitting
            in the middle of the row: it is a passing note, not a heading. */}
        <div
          className="anim-drop-in flex items-center justify-between"
          style={{ animationDelay: "0.1s" }}
        >
          <BackButton href="/activities/puzzle" label="Back to the puzzles" />

          <div className="flex items-center gap-2.5 sm:gap-3">
            <LevelBadge value={stage} label={`Puzzle ${stage}`} />

            <PuzzleHint picture={picture} helpsLeft={helpsLeft} onHelp={help} />
          </div>
        </div>
      </div>

      <div
        className={`mx-auto flex w-full flex-1 flex-col justify-center px-4 sm:px-8 ${
          upright ? "py-1 sm:py-6" : "py-8 sm:py-10"
        }`}
      >
        <PuzzleBoard
          ref={board}
          stage={stage}
          picture={picture}
          grid={grid}
          nextHref={nextHref}
        />
      </div>
    </>
  );
}
