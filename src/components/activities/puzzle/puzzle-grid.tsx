"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, Lock } from "lucide-react";
import type { PuzzleStage } from "@/types/puzzle";
import { puzzleKey, useProgress } from "@/store/progress";
import { PuzzleProgress } from "./puzzle-progress";

interface PuzzleGridProps {
  stages: PuzzleStage[];
}

const ITEM_DELAY = 0.12;
const ITEM_STAGGER = 0.05;

/** How long the whole grid takes to arrive, so the current card's breathe can
    start after it rather than during it. */
const GRID_SETTLED = ITEM_DELAY + 14 * ITEM_STAGGER;

/**
 * The fifteen puzzle stages, three to a row, with the child's position in the
 * set above them.
 *
 * **One card, three states.** Every stage is the same white card showing the
 * same artwork; only a small mark separates them — a green tick when
 * finished, a padlock behind frosted glass when locked, and a pink ring plus
 * a little extra lift on the ONE the child is on. Nothing here is a different
 * colour, a different size or a different shape from its neighbours, which is
 * what turns a grid of fifteen pictures into one journey with a position in
 * it.
 *
 * This replaced two earlier versions, in order: a card that was one of fifteen
 * clay tones with a huge numeral on it (the number WAS the card, and stages
 * 10–15 read as a keypad), then the same fifteen tones with a blue "Level N"
 * pill on the picture (fifteen hues on one screen read as a game template,
 * and a clay pill at that size reads as a button). Don't reintroduce either —
 * the colour on this page comes from the artwork.
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
     have not finished. It is the only card given any emphasis. */
  const currentValue = cast.find(({ open, done }) => open && !done)?.stage.value;

  return (
    <div>
      <PuzzleProgress done={finished} total={stages.length} />

      <ul className="grid grid-cols-3 gap-2.5 sm:gap-5">
        {cast.map(({ stage, index, open, done }) => {
          const current = stage.value === currentValue;

          const face = (
            <>
              {stage.picture && (
                <Image
                  src={stage.picture.image}
                  alt=""
                  fill
                  sizes="(min-width: 640px) 15rem, 31vw"
                  className={
                    open ? "object-cover" : "puzzle-locked-art object-cover"
                  }
                />
              )}

              {/* The glass over a locked picture. Skipped when there is no
                  picture at all — there would be nothing behind it. */}
              {!open && stage.picture && (
                <span aria-hidden className="puzzle-veil absolute inset-0" />
              )}

              {/* Status, top-right, deliberately small: these are marks that
                  say what a card IS, not controls. `.lock-chip` is the site's
                  shared clay padlock at its default lavender — it used to be
                  overridden to each stage's own colour, which is gone with
                  the rest of the fifteen. */}
              {!open && (
                <span className="lock-chip absolute right-1.5 top-1.5 h-5 w-5 sm:right-2.5 sm:top-2.5 sm:h-7 sm:w-7">
                  <Lock className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5" strokeWidth={3} />
                </span>
              )}

              {done && (
                <span
                  className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full sm:right-2.5 sm:top-2.5 sm:h-[1.375rem] sm:w-[1.375rem]"
                  style={{
                    backgroundColor: "var(--color-go)",
                    boxShadow:
                      "0 2px 7px -2px color-mix(in srgb, var(--color-go-dark) 70%, transparent)",
                  }}
                  aria-label="Finished"
                >
                  <Check
                    className="h-2.5 w-2.5 text-white sm:h-3.5 sm:w-3.5"
                    strokeWidth={4}
                  />
                </span>
              )}

              {/* Which level this is, bottom-left — the opposite corner from
                  the status mark, so neither ever crowds the other. */}
              <span
                aria-hidden
                className={`level-badge absolute bottom-1.5 left-1.5 sm:bottom-2.5 sm:left-2.5 ${
                  current ? "level-badge--current" : ""
                }`}
              >
                <span className="level-badge-word">LEVEL</span>
                <span className="level-badge-value">
                  {String(stage.value).padStart(2, "0")}
                </span>
              </span>
            </>
          );

          const shell = `card puzzle-card anim-rise-in relative block aspect-square overflow-hidden ${
            current ? "puzzle-card--current" : ""
          }`;

          const card = open ? (
            <Link
              href={`/activities/puzzle/${stage.value}`}
              aria-label={
                done
                  ? `Puzzle ${stage.value}, finished`
                  : `Start puzzle ${stage.value}`
              }
              className={`${shell} card-lift`}
              style={{ animationDelay: `${ITEM_DELAY + index * ITEM_STAGGER}s` }}
            >
              {face}
            </Link>
          ) : (
            <span
              aria-label={`Puzzle ${stage.value}, locked`}
              className={shell}
              style={{ animationDelay: `${ITEM_DELAY + index * ITEM_STAGGER}s` }}
            >
              {face}
            </span>
          );

          /* The breathe lives on a WRAPPING span, never on the card:
             `.card-lift:hover` animates `translate` on the card itself, and an
             infinite animation on the same property would keep overriding the
             hover. Held back until the last card has risen in —
             `.anim-breathe` fills `both`, so it sits still through the delay
             rather than jumping. */
          return (
            <li key={stage.value}>
              {current ? (
                <span
                  className="anim-breathe block"
                  style={{ animationDelay: `${GRID_SETTLED + 0.4}s` }}
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
