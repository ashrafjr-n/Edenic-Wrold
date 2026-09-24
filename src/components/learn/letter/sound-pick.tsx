"use client";

import { useState } from "react";
import type { LetterId } from "@/types/letter-item";
import type { OwnedWord } from "@/lib/letter-session";
import type { Dictionary } from "@/lib/dictionaries/en";
import { cueFor, playCue } from "@/lib/cue";
import { Celebration } from "@/components/ui/celebration";
import { QuestionPanel } from "./question-panel";
import { LetterGlyph } from "./letter-glyph";
import { WordPicture } from "./word-picture";

/** Misses before the right picture starts to glow. Help comes after a
    struggle, never before one, and nothing is ever taken off the board. */
const HELP_AFTER = 2;

interface SoundPickProps {
  letter: LetterId;
  choices: OwnedWord[];
  dict: Dictionary;
  onSolved: () => void;
  onMiss: () => void;
}

/**
 * Hear the letter's sound, pick the picture that has it. Pictures only — no
 * words under them — because the child is listening here, not reading: a
 * printed "apple" would give the answer away to a reader and mean nothing to
 * everyone else.
 */
export function SoundPick({ letter, choices, dict, onSolved, onMiss }: SoundPickProps) {
  const [picked, setPicked] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);
  const [misses, setMisses] = useState(0);
  const solved = picked !== null;

  const pick = (choice: OwnedWord) => {
    if (solved) return;
    void playCue(cueFor.word(choice.word));
    if (choice.letter === letter) {
      setPicked(choice.word);
      onSolved();
      return;
    }
    setWrong(choice.word);
    setMisses((count) => count + 1);
    onMiss();
  };

  return (
    <div className="flex w-full flex-col items-center gap-6 sm:gap-8">
      <QuestionPanel cue={cueFor.letterSound(letter)} cueLabel={dict.letters.hearSound}>
        <LetterGlyph letter={letter} capital={false} sizeClass="h-10 sm:h-12" sizes="48px" />
      </QuestionPanel>

      {/* Four answers, two by two, as large as the screen allows — capped
          by its height too, so the grid fills the band without overflowing. */}
      <ul className="grid w-full max-w-[min(26rem,36svh)] sm:max-w-[min(26rem,32svh)] grid-cols-2 gap-4 sm:gap-5">
        {choices.map((choice) => {
          const isAnswer = choice.letter === letter;
          const glow = !solved && isAnswer && misses >= HELP_AFTER;

          return (
            <li key={choice.word} className={`relative ${glow ? "guide-target" : ""}`}>
              <button
                type="button"
                onClick={() => pick(choice)}
                onAnimationEnd={() => setWrong(null)}
                aria-label={choice.word}
                className={`card card-clay-white flex aspect-square w-full items-center justify-center transition-transform duration-200 active:scale-95 ${
                  wrong === choice.word ? "anim-wiggle" : ""
                } ${solved && !isAnswer ? "opacity-40" : ""}`}
                style={
                  picked === choice.word
                    ? { outline: "4px solid var(--color-go)", outlineOffset: "3px" }
                    : undefined
                }
              >
                <WordPicture
                  word={choice}
                  sizeClass="h-[62%] w-[62%]"
                  sizes="(min-width: 640px) 160px, 110px"
                  emojiClass="text-7xl sm:text-8xl"
                />
              </button>
              {picked === choice.word && <Celebration />}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
