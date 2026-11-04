"use client";

import { useState } from "react";
import type { Stroke, StrokePoint } from "@/types/stroke";
import type { Dictionary } from "@/lib/dictionaries/en";
import { Celebration } from "@/components/ui/celebration";
import { StrokeDemo } from "./stroke-demo";
import { TraceBoard } from "./trace-board";

/** How much of the shape one stroke must go round, per attempt. It eases a
    little with every miss, so a child who is struggling still gets there —
    but never so far that half a shape passes. */
const TRACE_COVERAGE = [0.9, 0.85, 0.8];

interface TraceQuestionProps {
  strokes: readonly Stroke[];
  accent: string;
  dict: Dictionary["lessonPlayer"];
  /** The demo is over and the board is up — the player's "Your turn!"
      button, in the action band like every other button. */
  board: boolean;
  /** Passed, with the stroke the child drew (the done screen shows it). */
  onSolved: (stroke: StrokePoint[]) => void;
  onMiss: () => void;
}

/**
 * Draw the shape, in two beats: Pinki draws it first (the pen travelling the
 * outline), then the child traces it — in ONE stroke — on the same outline.
 * A pass fills the shape with colour — and it stays the shape (turning it
 * into a real thing was removed on request, 2026-11-04).
 */
export function TraceQuestion({ strokes, accent, dict, board, onSolved, onMiss }: TraceQuestionProps) {
  const [misses, setMisses] = useState(0);
  const [finished, setFinished] = useState(false);

  return (
    <div className="flex w-full flex-col items-center gap-4 sm:gap-6">
      {/* As big as the space allows: capped by the width AND by the screen's
          height, so the board fills its band without pushing the button off. */}
      <div className="trace-sheet card card-clay-white card-bare-lg relative w-full max-w-[min(20rem,42svh)] p-4 sm:max-w-[min(30rem,40svh)] sm:p-6 lg:max-w-[min(34rem,var(--stage-h))]">
        <div className="relative aspect-square">
          {board ? (
            <TraceBoard
              strokes={strokes}
              accent={accent}
              minCoverage={TRACE_COVERAGE[Math.min(misses, TRACE_COVERAGE.length - 1)]}
              onFinish={(stroke) => {
                setFinished(true);
                onSolved(stroke);
              }}
              onMiss={() => {
                setMisses((count) => count + 1);
                onMiss();
              }}
              locked={finished}
              dict={dict}
            />
          ) : (
            <StrokeDemo strokes={strokes} />
          )}
        </div>
        {finished && <Celebration />}
      </div>
    </div>
  );
}
