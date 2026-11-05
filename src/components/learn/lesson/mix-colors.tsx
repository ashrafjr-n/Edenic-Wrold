"use client";

import { useId, useMemo, useState, type CSSProperties } from "react";
import { Equal, Plus } from "lucide-react";
import { Celebration } from "@/components/ui/celebration";
import { COLORS } from "@/data/colors";
import { shuffle } from "@/lib/seeded";
import type { ColorId } from "@/types/course";
import { ClayWord } from "./clay-word";

/** After this many misses the answer glows, as on a Pick. */
const HELP_AFTER = 2;

interface MixColorsProps {
  a: ColorId;
  b: ColorId;
  color: ColorId;
  others: ColorId[];
  /** Deals the answers' order. */
  seed: string;
  onSolved: () => void;
  onMiss: () => void;
}

const paint = (color: ColorId) => ({ "--paint": COLORS[color].face }) as CSSProperties;

/**
 * Mix two paints (2026-11-05, on request: "nicer, more professional"): two
 * wobbling splashes, what they make still a dashed "?", three splashes to
 * answer with. The right answer makes the two run together — a gooey SVG
 * filter over them — into the new color, and its word comes up where the
 * answers were. A wrong one shakes; after two, the right one glows.
 */
export function MixColors({ a, b, color, others, seed, onSolved, onMiss }: MixColorsProps) {
  const goo = `goo${useId().replace(/[^\w-]/g, "")}`;
  const options = useMemo(() => shuffle([color, ...others], seed), [color, others, seed]);
  const [solved, setSolved] = useState(false);
  const [wrong, setWrong] = useState<ColorId | null>(null);
  const [misses, setMisses] = useState(0);

  const pick = (option: ColorId) => {
    if (solved) return;
    if (option === color) {
      setSolved(true);
      onSolved();
      return;
    }
    setWrong(option);
    setMisses((count) => count + 1);
    onMiss();
  };

  return (
    <div dir="ltr" className={`mix flex w-full flex-col items-center gap-5 sm:gap-7 ${solved ? "mix--done" : ""}`}>
      <div className="card card-clay-white card-bare-lg relative px-5 py-5 sm:px-8 sm:py-7">
        <svg width="0" height="0" className="absolute" aria-hidden>
          <filter id={goo}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
            <feColorMatrix in="blur" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10" />
          </filter>
        </svg>
        <div className="mix-sum" role="img" aria-label={`${a} + ${b}`}>
          <Plus className="mix-op mix-op--plus" strokeWidth={3.5} aria-hidden />
          <Equal className="mix-op mix-op--equal" strokeWidth={3.5} aria-hidden />
          <span className="mix-q paint-blob--wobble" aria-hidden>
            ?
          </span>
          <span className="mix-goo" style={solved ? { filter: `url(#${goo})` } : undefined}>
            <span className="paint-blob mix-a" style={paint(a)} />
            <span className="paint-blob mix-b" style={paint(b)} />
            <span className="paint-blob mix-result" style={paint(color)} />
          </span>
        </div>
        {solved && <Celebration />}
      </div>

      <div className="mix-answers">
        <ul className="mix-options">
          {options.map((option) => (
            <li key={option} className={!solved && option === color && misses >= HELP_AFTER ? "guide-target rounded-full" : ""}>
              <button
                type="button"
                aria-label={option}
                disabled={solved}
                onClick={() => pick(option)}
                onAnimationEnd={() => setWrong(null)}
                className={`card card-clay-white mix-option focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[var(--page-accent-color)] ${wrong === option ? "anim-wiggle" : ""}`}
              >
                <span className="paint-blob" style={paint(option)} />
              </button>
            </li>
          ))}
        </ul>
        {solved && (
          <span className="mix-word anim-pop-in">
            <ClayWord word={color} size="md" tone={COLORS[color].letter} />
          </span>
        )}
      </div>
    </div>
  );
}
