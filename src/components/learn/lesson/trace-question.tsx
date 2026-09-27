"use client";

import { useState } from "react";
import type { Stroke } from "@/types/stroke";
import type { Dictionary } from "@/lib/dictionaries/en";
import { AgainButton, NextButton } from "@/components/ui/morph-button";
import { Celebration } from "@/components/ui/celebration";
import { StrokeDemo } from "./stroke-demo";
import { TraceBoard } from "./trace-board";

/** How much of the shape must be covered, per attempt. It falls with every
    miss, so a child who is struggling always gets through. */
const TRACE_COVERAGE = [0.55, 0.42, 0.25];

const BRAND_TONE = { face: "var(--brand)", edge: "var(--brand-dark)", text: "#fff" };

interface TraceQuestionProps {
  strokes: readonly Stroke[];
  accent: string;
  dict: Dictionary["lessonPlayer"];
  dir: "rtl" | "ltr";
  /** The demo ended and the board is up — Pinki's line changes. */
  onBoard: () => void;
  onSolved: () => void;
  onMiss: () => void;
}

/**
 * Draw the shape, in two beats: Pinki draws it first (the pen travelling the
 * outline), then the child traces it on the same outline.
 */
export function TraceQuestion({ strokes, accent, dict, dir, onBoard, onSolved, onMiss }: TraceQuestionProps) {
  const [board, setBoard] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [misses, setMisses] = useState(0);
  const [finished, setFinished] = useState(false);

  return (
    <div className="flex w-full flex-col items-center gap-5 sm:gap-6">
      {/* As big as the space allows: capped by the width AND by the screen's
          height, so the board fills its band without pushing the button off. */}
      <div className="card card-clay-white relative w-full max-w-[min(20rem,42svh)] p-4 sm:max-w-[min(26rem,38svh)] sm:p-6">
        <div className="relative aspect-square">
          {board ? (
            <TraceBoard
              key={attempt}
              strokes={strokes}
              accent={accent}
              minCoverage={TRACE_COVERAGE[Math.min(misses, TRACE_COVERAGE.length - 1)]}
              onFinish={() => {
                setFinished(true);
                onSolved();
              }}
              onMiss={() => {
                setMisses((count) => count + 1);
                onMiss();
              }}
              locked={finished}
              dict={dict}
            />
          ) : (
            <StrokeDemo strokes={strokes} accent={accent} />
          )}
        </div>
        {finished && <Celebration />}
      </div>

      {board ? (
        <AgainButton
          label={dict.tryAgain}
          onPress={() => {
            setFinished(false);
            setAttempt((count) => count + 1);
          }}
          dir={dir}
        />
      ) : (
        <NextButton
          label={dict.yourTurn}
          tone={BRAND_TONE}
          onPress={() => {
            setBoard(true);
            onBoard();
          }}
          dir={dir}
        />
      )}
    </div>
  );
}
