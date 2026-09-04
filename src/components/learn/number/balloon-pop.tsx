"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import Image from "next/image";
import { Celebration } from "@/components/ui/celebration";

interface BalloonPopProps {
  /** The numbers on the balloons, answer included, in display order. */
  choices: number[];
  answer: number;
  onCorrect: () => void;
  onMiss: () => void;
}

const BALLOON = "/assets/learn-with-pinki/other/ballon.png";

/* One pink balloon asset, recoloured per position with `hue-rotate` — four
   different-coloured balloons out of a single file. The angles are picked to
   land on colours that belong to this palette rather than sweeping the wheel.

   Each list is read modulo its own length, so the layout can change the number
   of balloons without any of these having to be resized with it. */
const HUES = [0, 210, 80, 300];
const DRIFTS = ["3.2s", "3.8s", "3.4s", "4.1s"];
const DELAYS = ["0s", "0.4s", "0.8s", "0.2s"];

/**
 * "Pop Number 1!" — the last challenge, as a game rather than a question.
 *
 * Identical in substance to a four-option multiple choice, and completely
 * different to be on the end of: the balloons drift, the right one bursts, and
 * a wrong one bobs away and comes back. A child who has just done four
 * teaching steps has earned something that feels like play.
 *
 * A wrong pop is never marked wrong and never removes the balloon — it stays
 * poppable, so nothing can be eliminated by guessing.
 */
export function BalloonPop({
  choices,
  answer,
  onCorrect,
  onMiss,
}: BalloonPopProps) {
  const [popped, setPopped] = useState<number | null>(null);
  const [bobbing, setBobbing] = useState<number | null>(null);

  const pop = (value: number) => {
    if (popped !== null) return;

    if (value === answer) {
      setPopped(value);
      onCorrect();
      return;
    }

    /* Keyed by value so re-tapping the same balloon replays the bob; cleared
       on a timer because the shake is a one-shot animation. */
    setBobbing(value);
    window.setTimeout(() => setBobbing(null), 500);
    onMiss();
  };

  return (
    /* A 2 x 2 BLOCK, not a wrapping row. Wrapping laid four balloons across
       one line and dropped the fifth underneath on its own, which read as one
       of them having been left out rather than as a set to choose from. A
       fixed two-column grid says the same thing at every width, and it is
       what fixes the choice count at four. `justify-items-center` keeps each
       balloon centred in its cell as it drifts. */
    <div className="grid grid-cols-2 justify-items-center gap-3 sm:gap-6">
      {choices.map((value, index) => {
        const isPopped = popped === value;

        return (
          <button
            key={value}
            type="button"
            onClick={() => pop(value)}
            disabled={popped !== null}
            aria-label={`Pop the balloon with number ${value}`}
            className={`balloon-drift relative disabled:cursor-default ${
              bobbing === value ? "anim-wiggle" : ""
            } ${popped !== null && !isPopped ? "opacity-40" : ""}`}
            style={
              {
                "--drift-duration": DRIFTS[index % DRIFTS.length],
                "--drift-delay": DELAYS[index % DELAYS.length],
              } as CSSProperties
            }
          >
            <span className={`relative block ${isPopped ? "balloon-pop" : ""}`}>
              {/* Nested inside the popped balloon itself, not centred on the
                  whole row: every balloon keeps drifting via `balloon-drift`
                  on the button above, so a burst positioned against the row's
                  own centre would land wherever the balloon happened to be
                  when it popped — usually not there. As a descendant it
                  inherits the same drift transform and bursts from exactly
                  where the balloon is. */}
              {isPopped && <Celebration />}

              <Image
                src={BALLOON}
                alt=""
                width={428}
                height={568}
                className="h-24 w-auto object-contain sm:h-32"
                /* Both effects in ONE inline `filter`: an inline style beats a
                   Tailwind `drop-shadow-*` utility outright, so splitting them
                   silently drops the shadow. */
                style={{
                  filter: `hue-rotate(${HUES[index % HUES.length]}deg) drop-shadow(0 14px 18px rgb(92 78 190 / 28%))`,
                }}
              />

              {/* The numeral as type, not the clay render: a 3D numeral on a
                  3D balloon is two materials fighting, and white Fredoka on a
                  saturated balloon is far easier to read at this size. */}
              <span className="absolute inset-0 flex items-center justify-center pb-4 text-3xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)] sm:text-4xl">
                {value}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
