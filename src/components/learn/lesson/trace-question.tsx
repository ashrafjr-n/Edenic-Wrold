"use client";

import { useState } from "react";
import Image, { type StaticImageData } from "next/image";
import type { Stroke, StrokePoint } from "@/types/stroke";
import type { Dictionary } from "@/lib/dictionaries/en";
import { NextButton } from "@/components/ui/morph-button";
import { Celebration } from "@/components/ui/celebration";
import { StrokeDemo } from "./stroke-demo";
import { TraceBoard } from "./trace-board";

/** How much of the shape one stroke must go round, per attempt. It eases a
    little with every miss, so a child who is struggling still gets there —
    but never so far that half a shape passes. */
const TRACE_COVERAGE = [0.9, 0.85, 0.8];

const BRAND_TONE = { face: "var(--brand)", edge: "var(--brand-dark)", text: "#fff" };

interface TraceQuestionProps {
  strokes: readonly Stroke[];
  accent: string;
  /** What the finished shape becomes — a circle turns into a ball. */
  reward: { src: StaticImageData; word: string };
  dict: Dictionary["lessonPlayer"];
  dir: "rtl" | "ltr";
  /** The demo ended and the board is up. */
  onBoard: () => void;
  /** Passed, with the stroke the child drew (the done screen shows it). */
  onSolved: (stroke: StrokePoint[]) => void;
  onMiss: () => void;
}

/**
 * Draw the shape, in two beats: Pinki draws it first (the pen travelling the
 * outline), then the child traces it — in ONE stroke — on the same outline.
 * A pass fills the shape with colour, and then it turns into a real thing
 * (`reward`), so the shape is something from the child's world.
 */
export function TraceQuestion({ strokes, accent, reward, dict, dir, onBoard, onSolved, onMiss }: TraceQuestionProps) {
  const [board, setBoard] = useState(false);
  const [misses, setMisses] = useState(0);
  const [finished, setFinished] = useState(false);

  return (
    <div className="flex w-full flex-col items-center gap-4 sm:gap-6">
      {/* As big as the space allows: capped by the width AND by the screen's
          height, so the board fills its band without pushing the button off. */}
      <div className="card card-clay-white relative w-full max-w-[min(20rem,42svh)] p-4 sm:max-w-[min(26rem,38svh)] sm:p-6">
        <div className="relative aspect-square">
          {board ? (
            <div className={`h-full w-full ${finished ? "trace-morph-out" : ""}`}>
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
            </div>
          ) : (
            <StrokeDemo strokes={strokes} accent={accent} />
          )}

          {finished && (
            <Image
              src={reward.src}
              alt={reward.word}
              fill
              sizes="(min-width: 640px) 22rem, 17rem"
              className="trace-morph-in object-contain"
            />
          )}
        </div>
        {finished && <Celebration />}
      </div>

      {!board && (
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
