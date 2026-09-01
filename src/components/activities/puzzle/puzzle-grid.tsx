"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Lock } from "lucide-react";
import type { PuzzleStage } from "@/types/puzzle";
import { puzzleKey, useProgress } from "@/store/progress";

interface PuzzleGridProps {
  stages: PuzzleStage[];
}

const ITEM_DELAY = 0.15;
const ITEM_STAGGER = 0.06;

type ClayVars = CSSProperties & { "--clay-edge"?: string };

/**
 * The nine puzzle stages, three to a row.
 *
 * Every card is real clay — a coloured face with the site's grain over it and
 * the inflated shading every other `.clay` surface has. An unopened stage is
 * its own colour with its number on it, so a wall of nine reads as nine
 * different things to look forward to; the open one drops the colour and
 * shows the picture instead, because by then there is something better to
 * look at than a number.
 *
 * A stage opens when the one before it is finished AND its own picture
 * exists — a stage with no art stays shut however far the child has got, so
 * tapping a card can never land on a page with nothing to play.
 *
 * A Client Component only because unlocking depends on saved progress. Until
 * the store has read localStorage it renders the nothing-finished-yet view,
 * which is exactly what the server rendered — anything else is a hydration
 * mismatch.
 */
export function PuzzleGrid({ stages }: PuzzleGridProps) {
  const progress = useProgress((state) => state.items);
  const hydrated = useProgress((state) => state.hydrated);

  const starsFor = (value: number) =>
    hydrated ? (progress[puzzleKey(value)]?.stars ?? 0) : 0;

  const cast = stages.map((stage, index) => {
    const previous = stages[index - 1];
    const reached = previous ? starsFor(previous.value) > 0 : true;

    return {
      stage,
      index,
      open: reached && Boolean(stage.picture),
      done: starsFor(stage.value) > 0,
    };
  });

  /* The one stage the child has actually reached: the first open one they
     have not finished. It pulses so a glance at the grid says where to tap. */
  const nextValue = cast.find(({ open, done }) => open && !done)?.stage.value;

  return (
    <ul className="grid grid-cols-3 gap-3 sm:gap-5">
      {cast.map(({ stage, index, open, done }) => {
        /* `.clay` is declared after `.card` in globals.css, so its grain and
           inflated shading win over `.card`'s flat white — the fill itself
           still has to come from an inline style, since `.card` sets the
           `background` SHORTHAND and is unlayered (a Tailwind `bg-*` utility
           would silently lose). */
        const style = {
          animationDelay: `${ITEM_DELAY + index * ITEM_STAGGER}s`,
          backgroundColor: stage.tone.face,
          "--clay-edge": stage.tone.edge,
        } as ClayVars;

        const face = (
          <>
            {open && stage.picture && (
              <Image
                src={stage.picture.src}
                alt=""
                fill
                sizes="(min-width: 640px) 12rem, 30vw"
                className="object-cover"
              />
            )}

            {/* The number carries the card when there is no picture yet. */}
            {!open && (
              <span className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-white/90 sm:text-5xl">
                {stage.value}
              </span>
            )}

            {!open && (
              <span className="absolute bottom-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/85 sm:bottom-2.5 sm:right-2.5 sm:h-9 sm:w-9">
                <Lock
                  className="h-3.5 w-3.5 text-[var(--color-locked-text)] sm:h-4 sm:w-4"
                  strokeWidth={2.75}
                />
              </span>
            )}

            {/* Finished: a green clay tick, the same material as the cards
                themselves rather than a flat icon dropped on top. Dead centre
                of the card, not tucked in a corner — it is the card's whole
                message once the puzzle is done. */}
            {done && (
              <span
                className="clay absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full sm:h-16 sm:w-16"
                style={
                  {
                    backgroundColor: "var(--color-go)",
                    "--clay-edge": "var(--color-go-dark)",
                  } as ClayVars
                }
                aria-label="Finished"
              >
                <Check
                  className="h-7 w-7 text-white sm:h-9 sm:w-9"
                  strokeWidth={3.5}
                />
              </span>
            )}
          </>
        );

        return (
          <li key={stage.value}>
            {open ? (
              /* The pulse lives on a wrapping span so its continuous `scale`
                 never fights the card's own hover lift — Tailwind v4's
                 `scale` is a standalone property, and an infinite animation
                 on the same element would keep overriding it. */
              <span
                className={
                  stage.value === nextValue
                    ? "anim-pulse-invite block"
                    : "block"
                }
              >
                <Link
                  href={`/activities/puzzle/${stage.value}`}
                  aria-label={`Start puzzle ${stage.value}`}
                  className="card clay card-lift anim-rise-in relative block aspect-square overflow-hidden"
                  style={style}
                >
                  {face}
                </Link>
              </span>
            ) : (
              <span
                aria-label={`Puzzle ${stage.value}, locked`}
                className="card clay anim-rise-in relative block aspect-square overflow-hidden"
                style={style}
              >
                {face}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
