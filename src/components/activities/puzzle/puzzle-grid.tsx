"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Lock } from "lucide-react";
import type { PuzzleStage } from "@/types/puzzle";
import { puzzleKey, useProgress } from "@/store/progress";
import { PuzzleProgress } from "./puzzle-progress";

interface PuzzleGridProps {
  stages: PuzzleStage[];
}

const ITEM_DELAY = 0.15;
const ITEM_STAGGER = 0.06;

type ClayVars = CSSProperties & { "--clay-edge"?: string };
type LockVars = CSSProperties & { "--lock-face"?: string };
type VeilVars = CSSProperties & { "--veil-tone"?: string };

/**
 * The fifteen puzzle stages, three to a row, with the child's position in
 * the set above them.
 *
 * **Every card shows its picture, open or not.** A locked stage is the same
 * artwork behind a soft blur and a pale wash of its own colour, with a small
 * padlock on it — so the fifteen read as fifteen real places that exist and
 * have not been opened yet, rather than as a wall of coloured number
 * buttons. This replaced a version where a locked card was its tone with a
 * huge numeral on it: at that size the number WAS the card, and stages 10–15
 * looked like a keypad.
 *
 * The number is a small clay chip in the bottom-left of every card instead,
 * open or locked or finished, so a glance says which level a card is without
 * the number ever competing with the picture. Status lives in the opposite
 * corner: the padlock when locked, a small green tick when finished. The
 * tick used to be a large disc dead centre, which covered the artwork the
 * child had just earned the right to see.
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

  const finished = cast.filter(({ done }) => done).length;

  /* The one stage the child has actually reached: the first open one they
     have not finished. It rocks, so a glance at the grid says where to tap. */
  const nextValue = cast.find(({ open, done }) => open && !done)?.stage.value;

  return (
    <div>
      <PuzzleProgress done={finished} total={stages.length} />

      <ul className="grid grid-cols-3 gap-3 sm:gap-5">
        {cast.map(({ stage, index, open, done }) => {
          /* `.clay` is declared after `.card` in globals.css, so its grain and
             inflated shading win over `.card`'s flat white — the fill itself
             still has to come from an inline style, since `.card` sets the
             `background` SHORTHAND and is unlayered (a Tailwind `bg-*` utility
             would silently lose). It only shows through on a stage with no
             picture yet; everywhere else the artwork covers it. */
          const style = {
            animationDelay: `${ITEM_DELAY + index * ITEM_STAGGER}s`,
            backgroundColor: stage.tone.face,
            "--clay-edge": stage.tone.edge,
          } as ClayVars;

          const face = (
            <>
              {stage.picture && (
                <Image
                  src={stage.picture.image}
                  alt=""
                  fill
                  sizes="(min-width: 640px) 12rem, 30vw"
                  /* Scaled up while blurred, so the blur's own soft edges are
                     pushed outside the card instead of fading its border into
                     the page — `filter: blur()` samples transparency beyond the
                     image, and `overflow-hidden` cannot put that back. */
                  className={
                    open
                      ? "object-cover"
                      : "scale-110 object-cover blur-[3px] sm:blur-[4px]"
                  }
                />
              )}

              {/* The frosted wash over a locked picture. Skipped when there is
                  no picture — there is nothing to soften, and washing out the
                  bare clay would only make the card paler. */}
              {!open && stage.picture && (
                <span
                  aria-hidden
                  className="puzzle-veil absolute inset-0"
                  style={{ "--veil-tone": stage.tone.face } as VeilVars}
                />
              )}

              {/* `.lock-chip`, the site's shared clay padlock, but wearing this
                  stage's OWN darker edge rather than the dormant lavender: it
                  sits on that stage's own washed-out colour, and a lavender
                  chip on it would read as a sticker from another set. Every
                  other lock on the site takes the default face. */}
              {!open && (
                <span
                  className="lock-chip absolute right-1.5 top-1.5 h-6 w-6 sm:right-2.5 sm:top-2.5 sm:h-8 sm:w-8"
                  style={{ "--lock-face": stage.tone.edge } as LockVars}
                >
                  <Lock className="h-3 w-3 sm:h-4 sm:w-4" strokeWidth={2.75} />
                </span>
              )}

              {/* Finished: a small green clay tick in the status corner, the
                  same material as the cards themselves rather than a flat icon
                  dropped on top. It marks the card; the picture is still the
                  thing being looked at. */}
              {done && (
                <span
                  className="clay absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full sm:right-2.5 sm:top-2.5 sm:h-8 sm:w-8"
                  style={
                    {
                      backgroundColor: "var(--color-go)",
                      "--clay-edge": "var(--color-go-dark)",
                    } as ClayVars
                  }
                  aria-label="Finished"
                >
                  <Check
                    className="h-3.5 w-3.5 text-white sm:h-5 sm:w-5"
                    strokeWidth={3.5}
                  />
                </span>
              )}

              {/* Which level this is — on every card, the same brand blue on
                  all fifteen, small enough that the picture stays the
                  subject. */}
              <span
                aria-hidden
                className="stage-chip absolute bottom-1.5 left-1.5 sm:bottom-2.5 sm:left-2.5"
              >
                <span className="stage-chip-word">Level</span>
                {stage.value}
              </span>
            </>
          );

          const card = open ? (
            <Link
              href={`/activities/puzzle/${stage.value}`}
              aria-label={`Start puzzle ${stage.value}`}
              className="card clay card-lift anim-rise-in relative block aspect-square overflow-hidden"
              style={style}
            >
              {face}
            </Link>
          ) : (
            <span
              aria-label={`Puzzle ${stage.value}, locked`}
              className="card clay anim-rise-in relative block aspect-square overflow-hidden"
              style={style}
            >
              {face}
            </span>
          );

          /* The breathe lives on a WRAPPING span, never on the card:
             `.card-lift:hover` animates `translate` on the card itself, and an
             infinite animation on the same property would keep overriding the
             hover. Held back 1s so it starts after the last card has risen in
             (`ITEM_DELAY + 14 * ITEM_STAGGER`) — `.anim-breathe` fills `both`,
             so it sits still through the delay rather than jumping. */
          return (
            <li key={stage.value}>
              {stage.value === nextValue ? (
                <span
                  className="anim-breathe block"
                  style={{ animationDelay: "1s" }}
                >
                  {card}
                </span>
              ) : (
                card
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
