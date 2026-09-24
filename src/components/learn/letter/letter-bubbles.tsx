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

/* Soft clay faces, one per slot — the four character/brand hues, so no new
   colour enters the site. Fixed by position, not random: this renders on the
   server first. */
const FACES = ["var(--color-bloo)", "var(--color-gold)", "var(--color-go)", "var(--color-nova)"];

interface LetterBubblesProps {
  letter: LetterId;
  bubbles: Bubble[];
  dict: Dictionary;
  onSolved: () => void;
  onMiss: () => void;
}

/**
 * Pop every bubble that holds the letter — capital AND small, so the child
 * learns both are the same letter. A wrong bubble wobbles and stays; the
 * letter's own bubbles pop and are gone.
 */
export function LetterBubbles({ letter, bubbles, dict, onSolved, onMiss }: LetterBubblesProps) {
  const [popped, setPopped] = useState<number[]>([]);
  const [wrong, setWrong] = useState<number | null>(null);
  const targets = bubbles.filter((bubble) => bubble.letter === letter).length;

  const tap = (bubble: Bubble, index: number) => {
    if (popped.includes(index)) return;
    void playCue(cueFor.letterName(bubble.letter));
    if (bubble.letter !== letter) {
      setWrong(index);
      onMiss();
      return;
    }
    const next = [...popped, index];
    setPopped(next);
    if (next.length === targets) onSolved();
  };

  return (
    <div className="relative w-full max-w-lg">
      <ul className="grid grid-cols-4 gap-3 sm:gap-5">
        {bubbles.map((bubble, index) => {
          const gone = popped.includes(index);
          const face = FACES[index % FACES.length];

          return (
            <li
              key={index}
              className="anim-breathe flex justify-center"
              style={{ animationDelay: `${(index % 4) * 0.35}s` }}
            >
              <button
                type="button"
                onClick={() => tap(bubble, index)}
                onAnimationEnd={() => setWrong(null)}
                disabled={gone}
                aria-label={format(dict.letters.bubbleAria, {
                  letter: bubble.capital ? bubble.letter.toUpperCase() : bubble.letter,
                })}
                className={`clay flex aspect-square w-full max-w-[5.5rem] items-center justify-center rounded-full transition-[scale,opacity] duration-300 ${
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
                  sizeClass="h-9 sm:h-11"
                  sizes="44px"
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
