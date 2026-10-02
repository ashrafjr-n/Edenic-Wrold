"use client";

import { useMemo, useState } from "react";
import { Celebration } from "@/components/ui/celebration";
import { shuffle } from "@/lib/seeded";
import { format } from "@/lib/format-dict";
import type { Face } from "@/types/course";
import { FaceView } from "./face";

/** Two misses and the next one to tap starts to glow. */
const HINT_AFTER = 2;

interface OrderLineProps {
  /** In the right order — the family, oldest first. */
  items: Face[];
  /** Deals the tiles — a new seed is a new order. */
  seed: string;
  /** "Tap the {word}", naming each tile for a screen reader. */
  itemAria: string;
  onSolved: () => void;
  onMiss: () => void;
}

/** A face's English word, for its aria label. */
const wordOf = (face: Face) => (face.kind === "picture" ? face.word : face.kind === "shape" ? face.shape : face.text);

/**
 * Put them in order: a line of spaces on top, each a little smaller than
 * the one before it (oldest → youngest reads as big → small), and the
 * tiles dealt in a row under it. Tap the one that comes next and it lands
 * in the next space, leaving an empty socket behind; a wrong one only
 * wiggles, and after two misses the right one glows. All in → the line
 * jumps together.
 */
export function OrderLine({ items, seed, itemAria, onSolved, onMiss }: OrderLineProps) {
  const order = useMemo(() => shuffle(items.map((_, index) => index), seed), [items, seed]);
  const [placed, setPlaced] = useState(0);
  const [wrong, setWrong] = useState<number | null>(null);
  const [misses, setMisses] = useState(0);

  const solved = placed === items.length;
  const columns = { gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` };

  const tap = (index: number) => {
    if (solved || index < placed) return;
    if (index === placed) {
      setPlaced(placed + 1);
      if (placed + 1 === items.length) onSolved();
      return;
    }
    setWrong(index);
    setMisses((count) => count + 1);
    onMiss();
  };

  return (
    /* The taught content is English and reads left to right in every
       language — the line never mirrors. */
    <div dir="ltr" className="flex w-full max-w-[min(34rem,62svh)] flex-col items-center gap-8 sm:gap-10 lg:max-w-[min(40rem,calc(var(--stage-h)*1.1))]">
      <div className="card card-clay-white card-bare-lg relative grid w-full items-end gap-2 p-3 sm:gap-3 sm:p-4" style={columns}>
        {items.map((face, i) => (
          <span key={i} className="flex aspect-square items-end justify-center">
            <span
              className={`letter-slot relative flex items-center justify-center ${solved ? "find-cheer" : ""}`}
              style={{ width: `${100 - i * 12}%`, height: `${100 - i * 12}%`, ...(solved ? { animationDelay: `${i * 0.12}s` } : {}) }}
            >
              {i < placed && (
                <span className="anim-pop-in flex h-full w-full items-center justify-center">
                  <FaceView face={face} size="tile" />
                </span>
              )}
            </span>
          </span>
        ))}
        {solved && <Celebration />}
      </div>

      <ul className="grid w-full gap-3 sm:gap-4" style={columns}>
        {order.map((index) => {
          const used = index < placed;
          const glow = !solved && index === placed && misses >= HINT_AFTER;
          return (
            <li key={index} className={`relative ${glow ? "guide-target" : ""}`}>
              {used ? (
                <span className="letter-slot block aspect-square w-full" />
              ) : (
                <button
                  type="button"
                  onClick={() => tap(index)}
                  onAnimationEnd={() => setWrong(null)}
                  aria-label={format(itemAria, { word: wordOf(items[index]) })}
                  className={`card card-clay-white flex aspect-square w-full items-center justify-center transition-transform duration-200 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[var(--page-accent-color)] active:scale-95 ${
                    wrong === index ? "anim-wiggle" : ""
                  } ${solved ? "" : "hover:outline-4 hover:outline-offset-4 hover:outline-[color-mix(in_srgb,var(--page-accent-color)_45%,transparent)]"}`}
                >
                  <FaceView face={items[index]} size="tile" />
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
