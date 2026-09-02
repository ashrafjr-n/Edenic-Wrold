"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { Lock, Star } from "lucide-react";
import type { MemoryLevel } from "@/types/memory";
import { MAX_STARS } from "@/lib/memory-deck";
import { memoryKey, useProgress } from "@/store/progress";
import { ActivityProgress } from "@/components/activities/activity-progress";

interface MemoryGridProps {
  levels: MemoryLevel[];
}

const ITEM_DELAY = 0.15;
const ITEM_STAGGER = 0.06;

const GOLD = { face: "var(--color-gold)", edge: "var(--color-gold-dark)" };

type ClayVars = CSSProperties & { "--clay-edge"?: string };
type ChipVars = CSSProperties & {
  "--chip-face"?: string;
  "--chip-edge"?: string;
};

/**
 * The twelve levels, three to a row, with the child's position in the set
 * above them.
 *
 * **Every card is gold**, because gold leads this game the way green leads
 * the puzzles. What stops twelve gold cards reading as a keypad is that each
 * one shows its own BOARD in miniature — one pip per card, in that level's
 * real column count — so level 1 is visibly six cards in two rows and level
 * 12 is visibly sixteen in four, before either is opened. The puzzles solve
 * the same problem with their artwork; a memory level has no picture of its
 * own, so its shape is the picture.
 *
 * Stars sit on the card once it is finished (the ask was for progress and
 * stars at level level), the padlock when it is not open yet.
 *
 * A level opens when the one before it has been finished. A Client Component
 * only because that depends on saved progress — until the store has read
 * localStorage it renders the nothing-finished-yet view, which is exactly
 * what the server rendered; anything else is a hydration mismatch.
 */
export function MemoryGrid({ levels }: MemoryGridProps) {
  const progress = useProgress((state) => state.items);
  const hydrated = useProgress((state) => state.hydrated);

  const starsFor = (value: number) =>
    hydrated ? (progress[memoryKey(value)]?.stars ?? 0) : 0;

  const cast = levels.map((level, index) => {
    const previous = levels[index - 1];
    const stars = starsFor(level.value);

    return {
      level,
      index,
      stars,
      open: previous ? starsFor(previous.value) > 0 : true,
      done: stars > 0,
    };
  });

  const finished = cast.filter(({ done }) => done).length;

  /* The one level the child has actually reached: the first open one they
     have not finished. It rocks, so a glance says where to tap. */
  const nextValue = cast.find(({ open, done }) => open && !done)?.level.value;

  return (
    <div>
      <ActivityProgress
        label="Levels"
        done={finished}
        total={levels.length}
        tone={GOLD}
      />

      <ul className="grid grid-cols-3 gap-3 sm:gap-5">
        {cast.map(({ level, index, open, done, stars }) => {
          /* `.clay` is declared after `.card` in globals.css, so its grain and
             inflated shading win over `.card`'s flat white — the fill itself
             still has to come from an inline style, since `.card` sets the
             `background` SHORTHAND and is unlayered (a Tailwind `bg-*` utility
             would silently lose). */
          const style = {
            animationDelay: `${ITEM_DELAY + index * ITEM_STAGGER}s`,
            backgroundColor: "var(--color-gold)",
            "--clay-edge": "var(--color-gold-dark)",
          } as ClayVars;

          const face = (
            <>
              {/* The level's own board, in miniature. `aria-hidden` — the
                  label on the link already says which level this is and how
                  big it is. */}
              <span
                aria-hidden
                className={`memory-mini absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${
                  open ? "" : "opacity-45"
                }`}
                style={{
                  gridTemplateColumns: `repeat(${level.cols}, minmax(0, 1fr))`,
                }}
              >
                {Array.from({ length: level.pairs * 2 }, (_, pip) => (
                  <span key={pip} className="memory-mini-pip" />
                ))}
              </span>

              {!open && (
                <span className="lock-chip absolute right-1.5 top-1.5 h-6 w-6 sm:right-2.5 sm:top-2.5 sm:h-8 sm:w-8">
                  <Lock className="h-3 w-3 sm:h-4 sm:w-4" strokeWidth={2.75} />
                </span>
              )}

              {/* What the child scored, kept small and in the status corner so
                  it marks the card rather than covering it. Unearned stars
                  stay in place rather than being dropped, so three stars and
                  one star are the same shape at a glance — the same call
                  `StarReward` makes on the numbers journey. */}
              {done && (
                <span
                  className="absolute right-1.5 top-1.5 flex gap-0.5 sm:right-2.5 sm:top-2.5"
                  aria-hidden
                >
                  {Array.from({ length: MAX_STARS }, (_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                        i < stars
                          ? "fill-white text-white"
                          : "fill-transparent text-white/45"
                      }`}
                      strokeWidth={2.5}
                    />
                  ))}
                </span>
              )}

              {/* Which level this is, on every card — the same `.stage-chip`
                  the puzzles use, in gold rather than brand blue so it sits
                  inside this game's own colour instead of cutting across it. */}
              <span
                aria-hidden
                className="stage-chip absolute bottom-1.5 left-1.5 sm:bottom-2.5 sm:left-2.5"
                style={
                  {
                    "--chip-face": "var(--color-gold)",
                    "--chip-edge": "var(--color-gold-dark)",
                    color: "var(--color-ink)",
                  } as ChipVars
                }
              >
                <span className="stage-chip-word">Level</span>
                {level.value}
              </span>
            </>
          );

          const card = open ? (
            <Link
              href={`/activities/memory-match/${level.value}`}
              aria-label={`Start level ${level.value} — ${level.pairs} pairs`}
              className="card clay card-lift anim-rise-in relative block aspect-square overflow-hidden"
              style={style}
            >
              {face}
            </Link>
          ) : (
            <span
              aria-label={`Level ${level.value}, locked`}
              className="card clay anim-rise-in relative block aspect-square overflow-hidden"
              style={style}
            >
              {face}
            </span>
          );

          /* The breathe lives on a WRAPPING span, never on the card:
             `.card-lift:hover` animates `translate` on the card itself, and an
             infinite animation on the same property would keep overriding the
             hover. Held back until the last card has risen in. */
          return (
            <li key={level.value}>
              {level.value === nextValue ? (
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
