"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import type { LetterId } from "@/types/letter-item";
import type { Dictionary } from "@/lib/dictionaries/en";
import { cueFor, playCue } from "@/lib/cue";
import { format } from "@/lib/format-dict";
import { Celebration } from "@/components/ui/celebration";
import { LetterGlyph } from "./letter-glyph";

interface Pick {
  letter: LetterId;
  capital: boolean;
}

interface CaseMatchProps {
  /** Capitals, top row, in this order. */
  letters: LetterId[];
  /** The same letters, small, bottom row, shuffled. */
  smallOrder: LetterId[];
  accent: string;
  dict: Dictionary;
  onSolved: () => void;
  onMiss: () => void;
}

/**
 * Match big to small: tap a capital, then its small letter (either order
 * works). Tap-to-pair rather than drag — the same thing to a child, easier
 * for a small finger, and it works from a keyboard with no extra code.
 */
export function CaseMatch({ letters, smallOrder, accent, dict, onSolved, onMiss }: CaseMatchProps) {
  const [selected, setSelected] = useState<Pick | null>(null);
  const [matched, setMatched] = useState<LetterId[]>([]);
  const [wrong, setWrong] = useState<Pick[]>([]);

  const tap = (pick: Pick) => {
    if (matched.includes(pick.letter)) return;
    void playCue(cueFor.letterName(pick.letter));

    if (!selected || selected.capital === pick.capital) {
      setSelected(pick);
      return;
    }
    if (selected.letter === pick.letter) {
      const next = [...matched, pick.letter];
      setMatched(next);
      setSelected(null);
      if (next.length === letters.length) onSolved();
      return;
    }
    setWrong([selected, pick]);
    setSelected(null);
    onMiss();
  };

  const tile = (letter: LetterId, capital: boolean) => {
    const done = matched.includes(letter);
    const isSelected = selected?.letter === letter && selected.capital === capital;
    const isWrong = wrong.some((pick) => pick.letter === letter && pick.capital === capital);

    return (
      <li key={`${letter}-${capital}`} className="relative">
        <button
          type="button"
          onClick={() => tap({ letter, capital })}
          onAnimationEnd={() => setWrong([])}
          disabled={done}
          aria-pressed={isSelected}
          aria-label={format(dict.letters.tileAria, {
            letter: capital ? letter.toUpperCase() : letter,
          })}
          className={`card card-clay-white flex h-20 w-20 items-center justify-center transition-transform duration-200 active:scale-95 sm:h-24 sm:w-24 ${
            isWrong ? "anim-wiggle" : ""
          } ${isSelected ? "-translate-y-1.5" : ""}`}
          style={
            isSelected || done
              ? {
                  outline: `4px solid ${done ? "var(--color-go)" : accent}`,
                  outlineOffset: "3px",
                }
              : undefined
          }
        >
          <LetterGlyph
            letter={letter}
            capital={capital}
            sizeClass="h-12 sm:h-14"
            sizes="56px"
          />
        </button>
        {done && (
          <span
            className="clay absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full text-white"
            style={{ backgroundColor: "var(--color-go)", "--clay-edge": "var(--color-go-dark)" } as React.CSSProperties}
            aria-hidden
          >
            <Check className="h-4 w-4" strokeWidth={3} />
          </span>
        )}
      </li>
    );
  };

  return (
    <div className="relative flex w-full flex-col items-center gap-6 sm:gap-8">
      <ul className="flex flex-wrap justify-center gap-3 sm:gap-4">
        {letters.map((letter) => tile(letter, true))}
      </ul>
      <ul className="flex flex-wrap justify-center gap-3 sm:gap-4">
        {smallOrder.map((letter) => tile(letter, false))}
      </ul>
      {matched.length === letters.length && <Celebration />}
    </div>
  );
}
