"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { Check, Lock } from "lucide-react";
import type { MemoryLevel } from "@/types/memory";
import { memoryTone } from "@/data/memory-levels";
import { memoryKey, useProgress } from "@/store/progress";
import { ActivityProgress } from "@/components/ui/activity-progress";

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
 * the puzzles — but not the SAME gold: the twelve climb three shades of it,
 * four levels to a shade (`memoryTone`, `data/memory-levels.ts`), so the
 * bottom of the grid is visibly heavier than the top and a child can see the
 * ladder getting harder before opening anything. One colour, three depths,
 * never three colours.
 *
 * What stops twelve gold cards reading as a keypad is that each
 * one shows its own BOARD in miniature — one pip per card, in that level's
 * real column count — so level 1 is visibly six cards in two rows and level
 * 12 is visibly sixteen in four, before either is opened. The puzzles solve
 * the same problem with their artwork; a memory level has no picture of its
 * own, so its shape is the picture.
 *
 * A green tick marks a finished level, a padlock one that is not open yet.
 * Stars were here for one round and were removed on request — a better idea
 * for scoring is coming, and until it does a level is simply done or not.
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

    return {
      level,
      index,
      open: previous ? starsFor(previous.value) > 0 : true,
      done: starsFor(level.value) > 0,
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
        {cast.map(({ level, index, open, done }) => {
          /* Which rung of gold this level sits on — 1–4 light, 5–8 the base
             gold, 9–12 the deep one. */
          const tone = memoryTone(level.value);

          /* `.clay` is declared after `.card` in globals.css, so its grain and
             inflated shading win over `.card`'s flat white — the fill itself
             still has to come from an inline style, since `.card` sets the
             `background` SHORTHAND and is unlayered (a Tailwind `bg-*` utility
             would silently lose). */
          const style = {
            animationDelay: `${ITEM_DELAY + index * ITEM_STAGGER}s`,
            backgroundColor: tone.face,
            "--clay-edge": tone.edge,
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

              {/* Finished: the same green clay tick the puzzle stages use,
                  in the status corner opposite the level chip. Stars were
                  here for one round and were taken out again — a better idea
                  for scoring is coming, and a level is simply done or not
                  until it arrives. */}
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

              {/* Which level this is, on every card — the same `.stage-chip`
                  the puzzles use, in gold rather than brand blue so it sits
                  inside this game's own colour instead of cutting across it.
                  It takes the card's OWN shade, so the chip never reads as a
                  different rung from the card it is sitting on. */}
              <span
                aria-hidden
                className="stage-chip absolute bottom-1.5 left-1.5 sm:bottom-2.5 sm:left-2.5"
                style={
                  {
                    "--chip-face": tone.face,
                    "--chip-edge": tone.edge,
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
