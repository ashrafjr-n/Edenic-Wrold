"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import Image from "next/image";
import { Celebration } from "@/components/ui/celebration";
import { format } from "@/lib/format-dict";
import type { Dictionary } from "@/lib/dictionaries/en";

interface BalloonPopProps {
  dict: Dictionary["journey"];
  /** The numbers on the balloons, answer included, in flight order. */
  choices: number[];
  answer: number;
  onCorrect: () => void;
  onMiss: () => void;
  /** Every balloon rose off the top with the right one still floating. */
  onEscape: () => void;
}

const BALLOON = "/assets/learn-with-pinki/other/ballon.png";

/* One pink balloon asset, recoloured per position with `hue-rotate` — four
   different-coloured balloons out of a single file. The angles are picked to
   land on colours that belong to this palette rather than sweeping the wheel.

   Every list is read modulo its own length, so the number of balloons can
   change without any of them having to be resized with it. `LANES` are
   percentages of the sky's width — spread near its edges, because the sky is
   as wide as the journey column now and a narrower spread left a third of it
   empty; 14 and 86 are as far out as a balloon can sit without its own half
   width hanging past the crop on a 390px phone — and `RISE`/`DELAYS` are the
   flight itself:
   slow enough that a child has time to find the right numeral, staggered so
   the four never travel as a block. Fixed tables, never `Math.random()` —
   this stage renders on the server too, and a random flight would hydrate
   mismatched (the same rule the puzzle tray and the quiz decoys follow).

   The hues are pink / orange / green / purple: the old set had one at 80deg,
   which came out olive — fine on white, muddy against a blue sky. */
const HUES = [0, 45, 145, 285];
const LANES = [14, 40, 64, 86];
const RISE = [9, 11, 8.5, 10.5];
const DELAYS = [0, 1.2, 2.6, 0.6];
const DRIFTS = ["3.2s", "3.8s", "3.4s", "4.1s"];

const at = <T,>(list: readonly T[], index: number): T =>
  list[index % list.length];

/** When one balloon leaves the sky, in seconds from the round starting. */
const escapesAt = (index: number) => at(RISE, index) + at(DELAYS, index);

/**
 * "Pop Number 1!" — the last challenge, as a game rather than a question.
 *
 * **The balloons rise, and the round can be lost.** They drift up out of a
 * fixed sky, one carrying the number the child is learning, and that one has
 * to be popped before it leaves the top. A wrong pop is still never marked
 * wrong and never removes the balloon — it bobs and stays poppable, so
 * nothing can be eliminated by guessing — but letting the right one escape
 * ends the round and hands the stage back to Pinki, who offers another go.
 *
 * This replaced a static 2 x 2 grid of the same four balloons. Identical in
 * substance to a four-option multiple choice either way; the difference is
 * that a child who has just done four teaching steps gets something that
 * behaves like a game.
 */
export function BalloonPop({
  choices,
  answer,
  onCorrect,
  onMiss,
  onEscape,
  dict,
}: BalloonPopProps) {
  const [popped, setPopped] = useState<number | null>(null);
  const [bobbing, setBobbing] = useState<number | null>(null);

  /* The last balloon to leave the sky, so exactly ONE of them can end the
     round. Derived from the flight tables rather than counted as the balloons
     go: a counter would have to be incremented from an event handler and read
     back in the same tick, and this answer is already fixed before the round
     starts. */
  const lastOut = choices.reduce(
    (last, _, index) => (escapesAt(index) > escapesAt(last) ? index : last),
    0,
  );

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
    /* **A real sky, borrowed rather than invented**: `.trail-sky--day` is the
       gradient the Edenic Trail already runs on, and it is the one surface on
       the site a balloon can plausibly rise through. A plain white `.card`
       was tried first and read as a large empty panel with something moving
       in the bottom of it. Both are `.card` underneath, so the radius, the
       shadow and the dark-mode behaviour (the palette brings its own night
       ramp AND its starfield) come for free.

       `overflow-hidden` crops a balloon at both ends of its flight, and it is
       also what stops one that has already left being tappable — a clip clips
       hit-testing too. */
    <div className="card trail-sky--day balloon-sky anim-rise-in relative w-full overflow-hidden">
      {choices.map((value, index) => {
        const isPopped = popped === value;

        return (
          <button
            key={value}
            type="button"
            onClick={() => pop(value)}
            disabled={popped !== null}
            aria-label={format(dict.popBalloon, { value })}
            /* `top-full` puts it just under the sky; `.balloon-rise` carries
               it up through and out of the top. `left` is a lane rather than a
               utility because the keyframe owns `translate`, x-centring
               included. */
            className={`balloon-rise absolute top-full disabled:cursor-default ${
              popped !== null && !isPopped ? "opacity-40" : ""
            }`}
            onAnimationEnd={(event) => {
              /* The bob and the burst are animations on DESCENDANTS and bubble
                 up here as well, so the flight is told apart by its target
                 rather than by a keyframe name the build could rewrite. */
              if (event.target !== event.currentTarget) return;
              if (index === lastOut && popped === null) onEscape();
            }}
            style={
              {
                left: `${at(LANES, index)}%`,
                "--rise-duration": `${at(RISE, index)}s`,
                "--rise-delay": `${at(DELAYS, index)}s`,
                /* A popped balloon stops where it was hit: the burst reads as
                   the balloon going, not as it slipping away mid-burst. */
                animationPlayState: isPopped ? "paused" : undefined,
              } as CSSProperties
            }
          >
            {/* The bob rides `transform` while the flight above rides
                `translate`, which is the only reason the two can run at once
                on the same balloon. */}
            <span
              className="balloon-drift block"
              style={
                { "--drift-duration": at(DRIFTS, index) } as CSSProperties
              }
            >
              {/* The wrong-pop wiggle and the burst share this element: both
                  ride `transform`, and a balloon can never be doing both. It
                  is the innermost layer so neither touches the bob above it. */}
              <span
                className={`relative block ${isPopped ? "balloon-pop" : ""} ${
                  bobbing === value ? "anim-wiggle" : ""
                }`}
              >
                {/* Nested inside the popped balloon itself, not centred on the
                    sky: the balloon is somewhere up its own lane by the time
                    it is hit, and a burst positioned against the box would
                    land wherever the row used to be. As a descendant it
                    inherits the flight and bursts from exactly where the
                    balloon is. */}
                {isPopped && <Celebration />}

                <Image
                  src={BALLOON}
                  alt=""
                  width={96}
                  height={128}
                  className="h-24 w-auto object-contain sm:h-32 lg:h-36"
                  /* Both effects in ONE inline `filter`: an inline style beats
                     a Tailwind `drop-shadow-*` utility outright, so splitting
                     them silently drops the shadow. */
                  style={{
                    filter: `hue-rotate(${at(HUES, index)}deg) drop-shadow(0 14px 18px rgb(92 78 190 / 28%))`,
                  }}
                />

                {/* The numeral as type, not the clay render: a 3D numeral on a
                    3D balloon is two materials fighting, and white Fredoka on
                    a saturated balloon is far easier to read at this size. */}
                <span className="absolute inset-0 flex items-center justify-center pb-4 text-3xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)] sm:text-4xl">
                  {value}
                </span>
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
