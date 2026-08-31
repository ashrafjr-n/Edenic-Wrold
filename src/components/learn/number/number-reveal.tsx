"use client";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import Image from "next/image";
import { Sparkles } from "lucide-react";

interface NumberRevealProps {
  value: number;
  image: string;
  onFinish: () => void;
}

const COLS = 3;
const ROWS = 4;
const TOTAL = COLS * ROWS;
/** Every last sliver in a corner isn't required — a small child who has
    cleared most of the grid has clearly done the activity. */
const REVEAL_THRESHOLD = 0.75;

/** The numeral PNGs' own pixel size, so the grid sits over the image at
    exactly the ratio it renders at — same reasoning as `NumberComplete`. */
const IMAGE_W = 426;
const IMAGE_H = 585;

/** Existing subject tokens, reused rather than invented, cycled across the
    grid so it reads as a little mosaic instead of one flat color. */
const TILE_TONES = [
  { face: "var(--color-subject-numbers)", edge: "var(--color-subject-numbers-dark)" },
  { face: "var(--color-subject-colors)", edge: "var(--color-subject-colors-dark)" },
  { face: "var(--color-subject-shapes)", edge: "var(--color-subject-shapes-dark)" },
  { face: "var(--color-subject-letters)", edge: "var(--color-subject-letters-dark)" },
];

/**
 * "Reveal Number 6!" — the numeral starts hidden under a grid of little clay
 * tiles; a tap or a swipe clears whichever ones the finger passes over.
 *
 * Both a tap and a drag work through the same `elementFromPoint` lookup, so
 * a child can either dab tile by tile or wipe across several at once — the
 * same "either gesture works" rule `AppleGive` follows. Not `.clay` itself:
 * that class's shadow is tuned for card-sized shapes, and a dozen of them
 * packed edge to edge would bleed into a muddy pile, so these tiles use a
 * lighter inset-only version of the same idea.
 */
export function NumberReveal({ value, image, onFinish }: NumberRevealProps) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [dragging, setDragging] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (finished || revealed.size / TOTAL < REVEAL_THRESHOLD) return;
    setFinished(true);
    const timer = window.setTimeout(onFinish, 350);
    return () => window.clearTimeout(timer);
  }, [revealed, finished, onFinish]);

  const revealAt = (clientX: number, clientY: number) => {
    const target = document
      .elementFromPoint(clientX, clientY)
      ?.closest<HTMLElement>("[data-tile-index]");
    if (!target) return;
    const index = Number(target.dataset.tileIndex);

    setRevealed((current) => {
      if (current.has(index)) return current;
      const next = new Set(current);
      next.add(index);
      return next;
    });
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (finished) return;
    setDragging(true);
    revealAt(event.clientX, event.clientY);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging || finished) return;
    revealAt(event.clientX, event.clientY);
  };

  const stopDragging = () => setDragging(false);

  return (
    <div className="card anim-rise-in flex flex-col items-center gap-2 p-5 sm:p-7">
      <div
        className="relative mx-auto h-52 touch-none select-none sm:h-64"
        style={{ aspectRatio: `${IMAGE_W} / ${IMAGE_H}` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        onPointerLeave={stopDragging}
      >
        <Image src={image} alt={`The number ${value}`} fill className="object-contain" />

        {Array.from({ length: TOTAL }, (_, index) => {
          const row = Math.floor(index / COLS);
          const col = index % COLS;
          const tone = TILE_TONES[index % TILE_TONES.length];
          const isRevealed = revealed.has(index);

          return (
            <div
              key={index}
              data-tile-index={index}
              className={`absolute flex items-center justify-center rounded-lg transition-all duration-300 ${
                isRevealed ? "pointer-events-none scale-50 opacity-0" : "opacity-100"
              }`}
              style={{
                left: `${(col / COLS) * 100}%`,
                top: `${(row / ROWS) * 100}%`,
                width: `${100 / COLS}%`,
                height: `${100 / ROWS}%`,
                backgroundColor: tone.face,
                boxShadow: `inset 0 3px 5px -1px rgb(255 255 255 / 45%), inset 0 -4px 6px -2px ${tone.edge}`,
              }}
            >
              <Sparkles
                className="h-3.5 w-3.5 text-white/85 sm:h-4 sm:w-4"
                strokeWidth={2.5}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
