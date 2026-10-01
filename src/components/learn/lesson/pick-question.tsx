"use client";

import { useMemo, useState } from "react";
import { Celebration } from "@/components/ui/celebration";
import { shuffle } from "@/lib/seeded";
import type { Face } from "@/types/course";
import { FaceView } from "./face";
import { ClayWord } from "./clay-word";

/** After this many misses the answer glows. Nothing is ever removed. */
const HELP_AFTER = 2;

interface PickQuestionProps {
  show?: Face[];
  /** A taught word in clay letters above the tiles — "which one is this?". */
  word?: string;
  options: Face[];
  /** Index into `options`, before shuffling. */
  answer: number;
  /** Deals the tile order — a new seed is a new order. */
  seed: string;
  /** Pinki's turn: the answer glows and nothing can be tapped. */
  demo: boolean;
  onSolved: () => void;
  onMiss: () => void;
}

/**
 * Tap the right tile. What the question is about (`show`, e.g. "2 🍎 + 1 🍎 =
 * ?") sits on a clay card above big answer tiles. A wrong tap wiggles; after
 * two, the answer glows; a right one is ringed in green with confetti.
 */
export function PickQuestion({ show, word, options, answer, seed, demo, onSolved, onMiss }: PickQuestionProps) {
  const order = useMemo(() => shuffle(options.map((_, index) => index), seed), [options, seed]);
  const [solved, setSolved] = useState(false);
  const [wrong, setWrong] = useState<number | null>(null);
  const [misses, setMisses] = useState(0);

  const pick = (index: number) => {
    if (solved || demo) return;
    if (index === answer) {
      setSolved(true);
      onSolved();
      return;
    }
    setWrong(index);
    setMisses((count) => count + 1);
    onMiss();
  };

  /* Four tiles make a 2x2 square; two or three sit in one row. */
  const grid =
    options.length === 4
      ? "grid-cols-2 max-w-[min(26rem,36svh)] sm:max-w-[min(26rem,32svh)] lg:max-w-[min(28rem,calc(var(--stage-h)-7rem))]"
      : options.length === 3
        ? "grid-cols-3 max-w-[min(30rem,72svh)]"
        : "grid-cols-2 max-w-[min(22rem,44svh)]";

  return (
    <div className="flex w-full flex-col items-center gap-6 sm:gap-8 [@media(max-height:700px)]:gap-4">
      {word && <ClayWord word={word} size="sm" />}
      {show && (
        <div className="card card-clay-white card-bare-lg flex max-w-full flex-wrap items-center justify-center gap-2 px-5 py-4 sm:gap-3 sm:px-7">
          {show.map((face, index) => (
            <FaceView key={index} face={face} size="inline" />
          ))}
        </div>
      )}

      <ul className={`grid w-full gap-4 sm:gap-5 ${grid}`}>
        {order.map((index) => {
          const isAnswer = index === answer;
          const glow = !solved && isAnswer && (demo || misses >= HELP_AFTER);
          return (
            <li key={index} className={`relative ${glow ? "guide-target" : ""}`}>
              <button
                type="button"
                onClick={() => pick(index)}
                onAnimationEnd={() => setWrong(null)}
                disabled={demo}
                className={`card card-clay-white flex aspect-square w-full items-center justify-center transition-transform duration-200 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[var(--page-accent-color)] active:scale-95 ${
                  wrong === index ? "anim-wiggle" : ""
                } ${solved && !isAnswer ? "opacity-40" : ""} ${
                  solved || demo ? "" : "hover:outline-4 hover:outline-offset-4 hover:outline-[color-mix(in_srgb,var(--page-accent-color)_45%,transparent)]"
                }`}
                style={
                  solved && isAnswer
                    ? { outline: "4px solid var(--color-go)", outlineOffset: "3px" }
                    : undefined
                }
              >
                <FaceView face={options[index]} size="tile" />
              </button>
              {solved && isAnswer && <Celebration />}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
