"use client";

import { useState } from "react";
import type { LetterId } from "@/types/letter-item";
import type { Dictionary } from "@/lib/dictionaries/en";
import { cueFor } from "@/lib/cue";
import { format } from "@/lib/format-dict";
import { Celebration } from "@/components/ui/celebration";
import { QuestionPanel } from "./question-panel";
import { LetterGlyph } from "./letter-glyph";

const HELP_AFTER = 2;

interface LetterFindProps {
  letter: LetterId;
  choices: LetterId[];
  dict: Dictionary;
  onSolved: () => void;
  onMiss: () => void;
}

/** Hear a letter's name, tap that letter among four. */
export function LetterFind({ letter, choices, dict, onSolved, onMiss }: LetterFindProps) {
  const [solved, setSolved] = useState(false);
  const [wrong, setWrong] = useState<LetterId | null>(null);
  const [misses, setMisses] = useState(0);

  const pick = (choice: LetterId) => {
    if (solved) return;
    if (choice === letter) {
      setSolved(true);
      onSolved();
      return;
    }
    setWrong(choice);
    setMisses((count) => count + 1);
    onMiss();
  };

  return (
    <div className="flex w-full flex-col items-center gap-6 sm:gap-8">
      <QuestionPanel cue={cueFor.letterName(letter)} cueLabel={dict.letters.hearName} />

      <ul className="grid w-full max-w-[min(26rem,36svh)] sm:max-w-[min(26rem,32svh)] grid-cols-2 gap-4 sm:gap-5">
        {choices.map((choice) => {
          const glow = !solved && choice === letter && misses >= HELP_AFTER;
          return (
            <li key={choice} className={`relative ${glow ? "guide-target" : ""}`}>
              <button
                type="button"
                onClick={() => pick(choice)}
                onAnimationEnd={() => setWrong(null)}
                aria-label={format(dict.letters.tileAria, { letter: choice.toUpperCase() })}
                className={`card card-clay-white flex w-full items-center justify-center transition-transform duration-200 active:scale-95 ${
                  /* Two choices sit in one row — taller cards keep the pair
                     from being a thin strip across an empty band. */
                  choices.length <= 2 ? "aspect-[3/4]" : "aspect-square"
                } ${
                  wrong === choice ? "anim-wiggle" : ""
                } ${solved && choice !== letter ? "opacity-40" : ""}`}
                style={
                  solved && choice === letter
                    ? { outline: "4px solid var(--color-go)", outlineOffset: "3px" }
                    : undefined
                }
              >
                <LetterGlyph letter={choice} capital sizeClass="h-[52%]" sizes="(min-width: 640px) 110px, 80px" />
              </button>
              {solved && choice === letter && <Celebration />}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
