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

/** How long the whole grid takes to arrive, so the current tile's breathe can
    start after it rather than during it. */
const GRID_SETTLED = ITEM_DELAY + 14 * ITEM_STAGGER;

/**
 * The fifteen puzzle stages, three to a row, with the child's position in the
 * set above them.
 *
 * **One tile, three states.** Every stage is the same piece of clay with the
 * same artwork pressed into it, and only a small embossed mark separates
 * them — a green tick when finished, a translucent clay lid and a padlock
 * when locked, and a pink clay face with a deeper lift on the ONE the child
 * is on. That sameness is what turns a grid of fifteen pictures into one
 * journey with a position in it.
 *
 * The MATERIAL is the point here. This replaced a version where the card was
 * a white `.card` cropped to the picture and everything else on it was
 * ordinary web chrome laid on top — a white "LEVEL 01" glass pill, a flat
 * green tick disc, a hard pink outline ring on the current one. Nothing on
 * this page is a badge any more: the number is engraved into the tile's lip,
 * the marks are clay, the lock is a lid rather than a heavy frost, and the
 * current stage is picked out by elevation instead of a border. See the
 * `.puzzle-tile` block in `globals.css` for the rest of the reasoning; before
 * that came fifteen different clay tones, which read as a game template.
 *
 * A stage opens when the one before it is finished AND its own picture
 * exists — a stage with no art stays shut however far the child has got, so
 * tapping a tile can never land on a page with nothing to play.
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
     have not finished. It is the only tile given any emphasis. */
  const currentValue = cast.find(({ open, done }) => open && !done)?.stage.value;

  return (
    <div>
      <PuzzleProgress done={finished} total={stages.length} />

      <ul className="grid grid-cols-3 gap-2.5 sm:gap-5">
        {cast.map(({ stage, index, open, done }) => {
          const current = stage.value === currentValue;

          const face = (
            <>
              {/* The picture sits in a well pressed into the clay, never flush
                  with the tile's edge — the frame around it is what makes the
                  stage read as an object rather than as a thumbnail. */}
              <span className="puzzle-well">
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

                {/* The clay lid over a locked picture — the tile's own face
                    poured over the well at partial opacity, not a white frost.
                    Skipped when there is no picture at all; there would be
                    nothing behind it. */}
                {!open && stage.picture && (
                  <span aria-hidden className="puzzle-lid" />
                )}

                {/* Status, top-right, deliberately small and embossed: these
                    are marks that say what a tile IS, not controls, and the
                    artwork keeps essentially all of its own space. */}
                {!open && (
                  <span className="lock-chip absolute right-1.5 top-1.5 h-5 w-5 sm:right-2 sm:top-2 sm:h-7 sm:w-7">
                    <Lock
                      className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5"
                      strokeWidth={3}
                    />
                  </span>
                )}

                {done && (
                  <span
                    className="puzzle-tick absolute right-1.5 top-1.5 h-5 w-5 sm:right-2 sm:top-2 sm:h-7 sm:w-7"
                    aria-label="Finished"
                  >
                    <Check
                      className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5"
                      strokeWidth={4}
                    />
                  </span>
                )}
              </span>

              {/* Which stage this is, engraved into the clay below the
                  picture — the site's own type pressed into the lip, not a
                  chip laid over the artwork. */}
              <span aria-hidden className="puzzle-level">
                {String(stage.value).padStart(2, "0")}
              </span>
            </>
          );

          const shell = `puzzle-tile anim-rise-in relative ${
            open ? "puzzle-tile--open" : ""
          } ${current ? "puzzle-tile--current" : ""}`;

          const tile = open ? (
            <Link
              href={`/activities/puzzle/${stage.value}`}
              aria-label={
                done
                  ? `Puzzle ${stage.value}, finished`
                  : `Start puzzle ${stage.value}`
              }
              className={shell}
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

          /* The bounce lives on a WRAPPING span, never on the tile itself:
             `.puzzle-tile--open:hover` animates `translate`, and an infinite
             animation on the same property would keep overriding the hover.
             Held back until the last tile has risen in — `.anim-breathe`
             fills `both`, so it sits still through the delay rather than
             jumping. */
          return (
            <li key={stage.value}>
              {current ? (
                <span
                  className="anim-breathe block"
                  style={{ animationDelay: `${GRID_SETTLED + 0.4}s` }}
                >
                  {tile}
                </span>
              ) : (
                tile
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
