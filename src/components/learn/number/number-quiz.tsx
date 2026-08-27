"use client";

import { useState } from "react";
import { numberItems } from "@/data/number-items";
import { Numeral } from "./numeral";

interface NumberQuizProps {
  /** The numbers on offer, answer included, already in display order. */
  choices: number[];
  answer: number;
  /** Frozen once the round is won, so the picked numeral stays on screen. */
  solved: boolean;
  onCorrect: () => void;
}

interface WrongPick {
  value: number;
  /** Bumped on every wrong tap, so re-tapping the same numeral shakes again
      instead of doing nothing because its id is already in the list. */
  attempt: number;
}

const imageFor = (value: number) =>
  numberItems.find((item) => item.value === value)?.image ?? "";

/**
 * "Which one is this?" — the child taps the numeral they just traced.
 *
 * A wrong pick shakes its head and steps back rather than saying anything:
 * nothing on this site tells a child they are wrong in words, and there is no
 * penalty — they keep picking until they find it. Wrong ones stay visible and
 * dimmed, so the choice narrows instead of the row reshuffling under them.
 */
export function NumberQuiz({
  choices,
  answer,
  solved,
  onCorrect,
}: NumberQuizProps) {
  const [wrong, setWrong] = useState<WrongPick[]>([]);

  const pick = (value: number) => {
    if (solved) return;

    if (value === answer) {
      onCorrect();
      return;
    }

    setWrong((picked) => [
      ...picked.filter((entry) => entry.value !== value),
      { value, attempt: picked.length + 1 },
    ]);
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
      {choices.map((value) => {
        const wrongPick = wrong.find((entry) => entry.value === value);
        const isAnswer = value === answer;
        /* Once it is won, everything except the answer fades out of the way. */
        const dimmed = (solved && !isAnswer) || Boolean(wrongPick);

        return (
          <button
            /* The attempt is part of the key so a repeat wrong tap remounts
               the button and replays the one-shot shake. */
            key={`${value}-${wrongPick?.attempt ?? 0}`}
            type="button"
            onClick={() => pick(value)}
            disabled={solved}
            aria-label={`The number ${value}`}
            className={`rounded-3xl transition-opacity duration-300 disabled:cursor-default ${
              dimmed ? "opacity-30" : "opacity-100"
            } ${wrongPick ? "anim-wiggle" : ""}`}
          >
            <Numeral
              value={value}
              image={imageFor(value)}
              sizeClass="h-20 w-20 sm:h-28 sm:w-28"
              decorative
            />
          </button>
        );
      })}
    </div>
  );
}
