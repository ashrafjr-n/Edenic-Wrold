"use client";

import { useState } from "react";
import type { LetterItem } from "@/types/letter-item";
import type { Dictionary } from "@/lib/dictionaries/en";
import { letterGuide } from "@/data/letter-strokes";
import { StrokeDemo } from "@/components/learn/number/stroke-demo";
import { TraceBoard } from "@/components/learn/number/trace-board";
import { AgainButton, NextButton } from "@/components/ui/morph-button";
import { Celebration } from "@/components/ui/celebration";

/** How much of the letter has to be covered, per attempt — it falls with
    every miss, so a child who is struggling always gets through. The same
    ladder the numerals use. */
const TRACE_COVERAGE = [0.55, 0.42, 0.25];

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
    </svg>
  );

  return (
    <div className="flex w-full flex-col items-center gap-5 sm:gap-6">
      <div className="card card-clay-white relative w-full max-w-[17rem] p-4 sm:max-w-[22rem] sm:p-6">
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
