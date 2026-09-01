"use client";

import Image from "next/image";
import Link from "next/link";
import { Lock } from "lucide-react";
import type { PuzzleStage } from "@/types/puzzle";
import { puzzleKey, useProgress } from "@/store/progress";

interface PuzzleGridProps {
  stages: PuzzleStage[];
}

const ITEM_DELAY = 0.15;
const ITEM_STAGGER = 0.06;

/**
 * The nine puzzle stages, three to a row.
 *
 * A stage is open when the one before it has been finished AND its own
 * picture exists — a stage with no art stays locked however far the child has
 * got, so tapping a card can never land on a page with nothing to play.
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
      stars: starsFor(stage.value),
    };
  });

  /* The one stage the child has actually reached: the first open one they
     have not finished. It pulses so a glance at the grid says where to tap. */
  const nextValue = cast.find(({ open, stars }) => open && stars === 0)?.stage
    .value;

  return (
    <ul className="grid grid-cols-3 gap-3 sm:gap-5">
      {cast.map(({ stage, index, open, stars }) => {
        const style = {
          animationDelay: `${ITEM_DELAY + index * ITEM_STAGGER}s`,
        };

        const face = (
          <>
            {/* The picture itself is the card once the stage is open — a
                child picks the puzzle they want to build by looking at it,
                not by reading a number. */}
            {open && stage.picture && (
              <Image
                src={stage.picture.src}
                alt=""
                fill
                sizes="(min-width: 640px) 12rem, 30vw"
                className="object-cover"
              />
            )}

            <span
              className={`card card-pill absolute bottom-1.5 left-1.5 flex h-7 w-7 items-center justify-center text-sm font-bold sm:bottom-2.5 sm:left-2.5 sm:h-9 sm:w-9 sm:text-base ${
                open
                  ? "text-[var(--color-ink)]"
                  : "text-[var(--color-locked-text)]"
              }`}
            >
              {stage.value}
            </span>

            {!open && (
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-[0_8px_18px_-6px_rgb(var(--shadow-hue)/45%)] sm:h-11 sm:w-11">
                  <Lock
                    className="h-4 w-4 text-[var(--color-locked-text)] sm:h-5 sm:w-5"
                    strokeWidth={2.75}
                  />
                </span>
              </span>
            )}

            {/* Stars sit on the card itself, so the grid doubles as the
                record of what has been finished. */}
            {stars > 0 && (
              <span
                className="absolute right-1.5 top-1.5 flex gap-0.5 sm:right-2.5 sm:top-2.5"
                aria-label={`${stars} of 3 stars`}
              >
                {Array.from({ length: stars }, (_, star) => (
                  <Image
                    key={star}
                    src="/assets/icons/yellow-star.png"
                    alt=""
                    width={140}
                    height={140}
                    className="h-4 w-4 object-contain sm:h-5 sm:w-5"
                  />
                ))}
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
                  className="card card-lift anim-rise-in relative block aspect-square overflow-hidden"
                  style={style}
                >
                  {face}
                </Link>
              </span>
            ) : (
              <span
                aria-label={`Puzzle ${stage.value}, locked`}
                className="card anim-rise-in relative block aspect-square overflow-hidden"
                /* `.card` sets the `background` shorthand and is unlayered, so
                   a Tailwind `bg-*` utility would silently lose here — the
                   locked fill has to come from an inline style. */
                style={{ ...style, backgroundColor: "var(--color-locked)" }}
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
