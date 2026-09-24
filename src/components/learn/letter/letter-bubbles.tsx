"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import type { LetterId } from "@/types/letter-item";
import type { Bubble } from "@/lib/letter-session";
import type { Dictionary } from "@/lib/dictionaries/en";
import { cueFor, playCue } from "@/lib/cue";
import { format } from "@/lib/format-dict";
import { Celebration } from "@/components/ui/celebration";
import { LetterGlyph } from "./letter-glyph";

/* Soft clay faces, one per slot — existing hues only, and never pink: the
   letters themselves are pink clay and would vanish on it. Fixed by
   position, not random: this renders on the server first. */
const FACES = ["var(--color-bloo)", "var(--color-gold)", "var(--color-go)"];

interface LetterBubblesProps {
  letter: LetterId;
  bubbles: Bubble[];
  /** Only the CAPITAL counts — see `bigOnly` in `lib/letter-session.ts`. */
  bigOnly: boolean;
  dict: Dictionary;
  onSolved: () => void;
  onMiss: () => void;
}

/**
 * Pop every bubble that holds the letter — capital AND small, so the child
 * learns both are the same letter. A wrong bubble wobbles and stays; the
 * letter's own bubbles pop and are gone.
 */
export function LetterBubbles({ letter, bubbles, bigOnly, dict, onSolved, onMiss }: LetterBubblesProps) {
  const [popped, setPopped] = useState<number[]>([]);
  const [wrong, setWrong] = useState<number | null>(null);
  const isTarget = (bubble: Bubble) => bubble.letter === letter && (!bigOnly || bubble.capital);
  const targets = bubbles.filter(isTarget).length;

  const tap = (bubble: Bubble, index: number) => {
    if (popped.includes(index)) return;
    void playCue(cueFor.letterName(bubble.letter));
    if (!isTarget(bubble)) {
      setWrong(index);
      onMiss();
      return;
    }
    const next = [...popped, index];
    setPopped(next);
    if (next.length === targets) onSolved();
  };

  return (
    /* Three across, and as large as the column allows — nine bubbles are the
       whole screen's game, not a strip across the top of it. */
    <div className="relative w-full max-w-sm sm:max-w-[min(32rem,44svh)]">
      <ul className="grid grid-cols-3 gap-4 sm:gap-6">
        {bubbles.map((bubble, index) => {
          const gone = popped.includes(index);
          const face = FACES[index % FACES.length];

          return (
            <li
              key={index}
              className="anim-breathe flex justify-center"
              style={{ animationDelay: `${(index % 3) * 0.4 + Math.floor(index / 3) * 0.2}s` }}
            >
              <button
                type="button"
                onClick={() => tap(bubble, index)}
                onAnimationEnd={() => setWrong(null)}
                disabled={gone}
                aria-label={format(dict.letters.bubbleAria, {
                  letter: bubble.capital ? bubble.letter.toUpperCase() : bubble.letter,
                })}
                className={`clay flex aspect-square w-full items-center justify-center rounded-full transition-[scale,opacity] duration-300 ${
                  gone ? "pointer-events-none scale-0 opacity-0" : "active:scale-90"
                } ${wrong === index ? "anim-wiggle" : ""}`}
                style={
                  {
                    backgroundColor: `color-mix(in srgb, ${face} 45%, #fff)`,
                    "--clay-edge": face,
                  } as CSSProperties
                }
              >
                <LetterGlyph
                  letter={bubble.letter}
                  capital={bubble.capital}
                  sizeClass="h-12 sm:h-16"
                  sizes="(min-width: 640px) 64px, 48px"
                />
              </button>
            </li>
          );
        })}
      </ul>
      {popped.length === targets && <Celebration />}
    </div>
  );
}
