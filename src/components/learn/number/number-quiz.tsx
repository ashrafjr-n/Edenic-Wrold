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
  /** Every wrong tap. The journey counts these toward the final star score —
      the quiz itself never scores, never blocks and never gives up an answer. */
  onWrong: () => void;
}

interface WrongPick {
  value: number;
  /** Bumped on every wrong tap, so re-tapping the same numeral shakes again
      instead of doing nothing because its id is already in the list. */
  attempt: number;
}

const imageFor = (value: number) =>
  numberItems.find((item) => item.value === value)?.image ?? "";

/** How many wrong taps before Pinki starts helping. One, not zero: the child
    has to get a real attempt of their own first — help offered before anybody
    has tried is not scaffolding, it is answering the question for them. */
const HELP_AFTER_MISSES = 1;

/** The most choices that may ever be dimmed at once, answer included, as a
    count BACK from the total. Two must always be left standing: the moment
    only the answer is lit, the child is not choosing any more, and this site's
    standing rule is that nothing can be eliminated by guessing. */
const MIN_LIVE_CHOICES = 2;

/**
 * "Which one is this?" — the child taps the numeral they just traced.
 *
 * A wrong pick shakes its head and steps back rather than saying anything:
 * nothing on this site tells a child they are wrong in words, and there is no
 * penalty — they keep picking until they find it. Wrong ones stay visible and
 * dimmed, so the choice narrows instead of the row reshuffling under them.
 *
 * **After a miss — never before one — Pinki starts helping**, and the shape of
 * that help is the careful part. The child has to have tried alone first, or
 * the question was never asked. And however much help accumulates, two choices
 * always stay standing: a row where only the answer is lit is not a question
 * any more, and this site's rule is that nothing can be eliminated by guessing.
 * The dimming budget below is what enforces that against BOTH sources of
 * fading at once, since a wrong tap and a hint look exactly the same on screen.
 */
export function NumberQuiz({
  choices,
  answer,
  solved,
  onCorrect,
  onWrong,
}: NumberQuizProps) {
  const [wrong, setWrong] = useState<WrongPick[]>([]);

  const pick = (value: number) => {
    if (solved) return;

    if (value === answer) {
      onCorrect();
      return;
    }

    onWrong();
    setWrong((picked) => [
      ...picked.filter((entry) => entry.value !== value),
      { value, attempt: picked.length + 1 },
    ]);
  };

  /* Pinki starting to help, after the child has tried alone. */
  const helping = !solved && wrong.length >= HELP_AFTER_MISSES;

  /* How many MORE choices may be dimmed as a hint, on top of the ones the
     child has already tried. Those two kinds of dimming look identical on
     screen, so they have to be budgeted together or the hint would quietly
     push past the "never leave the answer standing alone" rule by adding to a
     row that was already narrowed.

     At the three choices this quiz actually uses, one wrong tap spends the
     whole budget, so no extra numeral is ever dimmed and the help the child
     sees is the halo below. The arithmetic is here rather than a hard-coded
     nothing because `choices` is a prop — the `count` stage passes its own. */
  const hintDimBudget = helping
    ? Math.max(0, choices.length - MIN_LIVE_CHOICES - wrong.length)
    : 0;

  const hintDimmed = choices
    .filter((value) => value !== answer && !wrong.some((e) => e.value === value))
    .slice(0, hintDimBudget);

  /* ONE place decides how every choice is shown. The wrong-tap fade, the
     won-round fade and the hint fade are the same `opacity` on the same
     element, so computing them anywhere but together is how they end up
     contradicting each other. */
  const view = choices.map((value) => {
    const wrongPick = wrong.find((entry) => entry.value === value);
    const isAnswer = value === answer;

    return {
      value,
      wrongPick,
      /* Once it is won, everything except the answer fades out of the way. */
      dimmed:
        (solved && !isAnswer) ||
        Boolean(wrongPick) ||
        hintDimmed.includes(value),
      /* The halo, on the answer alone and only once help has started. It is
         deliberately the louder half of the hint: with three choices there is
         no dimming budget left, so without it a struggling child would get
         nothing at all after a miss. */
      hinted: helping && isAnswer,
      solvedAnswer: solved && isAnswer,
    };
  });

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 lg:gap-10">
      {view.map(({ value, wrongPick, dimmed, hinted, solvedAnswer }) => {
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
            } ${wrongPick ? "anim-wiggle" : ""} ${
              solvedAnswer ? "anim-jump" : ""
            } ${hinted ? "guide-target" : ""}`}
          >
            <Numeral
              value={value}
              image={imageFor(value)}
              /* A size up at every breakpoint: these numerals ARE the
                 question, and at the old size they were smaller than the
                 apples the child had just counted. */
              sizeClass="h-24 w-24 sm:h-32 sm:w-32 lg:h-36 lg:w-36"
              decorative
            />
          </button>
        );
      })}
    </div>
  );
}
