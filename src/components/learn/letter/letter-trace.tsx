"use client";

import { useState } from "react";
import type { LetterItem } from "@/types/letter-item";
import type { Dictionary } from "@/lib/dictionaries/en";
import { letterGuide } from "@/data/letter-strokes";
import { StrokeDemo } from "@/components/learn/number/stroke-demo";
import { TraceBoard } from "@/components/learn/number/trace-board";
import { strokeLength } from "@/lib/trace-score";
import { AgainButton, NextButton } from "@/components/ui/morph-button";
import { Celebration } from "@/components/ui/celebration";

/** How much of EACH stroke has to be covered, per attempt. Higher than the
    numerals' whole-shape ladder (0.55 / 0.42 / 0.25) on purpose: letters are
    judged stroke by stroke and must be written properly. It still falls with
    every miss, so a child who is struggling gets through. */
const TRACE_COVERAGE = [0.75, 0.65, 0.55];

const BRAND_TONE = { face: "var(--brand)", edge: "var(--brand-dark)", text: "#fff" };

interface LetterTraceProps {
  item: LetterItem;
  capital: boolean;
  accent: string;
  dict: Dictionary;
  dir: "rtl" | "ltr";
  /** Fired when the demo ends and the board appears — Pinki's line changes. */
  onBoard: () => void;
  onSolved: () => void;
  onMiss: () => void;
}

/**
 * Write the letter, in two beats: Pinki draws it first (the pen travelling
 * the strokes in order, on the writing lines), then the child traces it on
 * the same lines. The numerals' own demo and trace board, reused whole —
 * only the strokes and the lines under them are the letter's.
 */
export function LetterTrace({
  item,
  capital,
  accent,
  dict,
  dir,
  onBoard,
  onSolved,
  onMiss,
}: LetterTraceProps) {
  const [board, setBoard] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [misses, setMisses] = useState(0);
  const [finished, setFinished] = useState(false);

  const strokes = capital ? item.capitalStrokes : item.smallStrokes;
  const guide = letterGuide(item.id, capital);
  /* A dot (i, j) is a tap at the end, not a stroke to number. */
  const numbered = strokes.filter((stroke) => strokeLength(stroke) >= 6);

  /* Under the board: the two writing lines, and a numbered dot where each
     stroke starts — the order to write it in, readable without words. Dots
     (i, j) get no number; they are the last touch, not a stroke. */
  const lines = (
    <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
      <line
        x1="0" x2="100" y1={guide.top} y2={guide.top}
        stroke="var(--color-locked-dark)" strokeWidth="0.8" strokeDasharray="3 3"
      />
      <line
        x1="0" x2="100" y1={guide.base} y2={guide.base}
        stroke="var(--color-locked-dark)" strokeWidth="1.2"
      />
      {numbered.length > 1 &&
        numbered.map((stroke, index) => {
          const [x, y] = stroke[0];
          return (
            <g key={index}>
              <circle cx={x} cy={y} r="4.6" fill={accent} />
              <text
                x={x}
                y={y}
                dy="0.35em"
                textAnchor="middle"
                fontSize="6"
                fontWeight="700"
                fill="#fff"
              >
                {index + 1}
              </text>
            </g>
          );
        })}
    </svg>
  );

  return (
    <div className="flex w-full flex-col items-center gap-5 sm:gap-6">
      {/* As big as the space allows: capped by the width AND by the screen's
          height, so the board fills its band without pushing the button off. */}
      <div className="card card-clay-white relative w-full max-w-[min(20rem,42svh)] p-4 sm:max-w-[min(26rem,38svh)] sm:p-6">
        <div className="relative aspect-square">
          {lines}
          <div className="absolute inset-0">
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
                strict
                dict={{ ...dict.journey, traceInstruction: dict.letters.traceAria }}
              />
            ) : (
              <StrokeDemo strokes={strokes} accent={accent} />
            )}
          </div>
        </div>
        {finished && <Celebration />}
      </div>

      {board ? (
        <AgainButton
          label={dict.journey.tryAgain}
          onPress={() => {
            setFinished(false);
            setAttempt((count) => count + 1);
          }}
          dir={dir}
        />
      ) : (
        <NextButton
          label={dict.journey.myTurn}
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
