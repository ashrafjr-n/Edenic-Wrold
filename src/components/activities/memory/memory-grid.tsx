"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { Check, Lock } from "lucide-react";
import type { MemoryLevel, MemoryTone } from "@/types/memory";
import { memoryKey, useProgress } from "@/store/progress";
import { ActivityProgress } from "@/components/ui/activity-progress";

interface MemoryGridProps {
  levels: MemoryLevel[];
}

const ITEM_DELAY = 0.15;
const ITEM_STAGGER = 0.06;

const GOLD = { face: "var(--color-gold)", edge: "var(--color-gold-dark)" };

/** What a card IS, which is the only thing its colour says. Sequential
    unlocking means these three are exhaustive: a level is open only once the
    one before it is finished, so there can never be an open level that is
    neither finished nor the next one to play. */
type LevelState = "done" | "next" | "locked";

/**
 * **Three shades of the one gold, one per state — never a shade per level.**
 *
 * Finished cards are all the base gold, every single one; the level to play
 * next is the deep gold and wears a glow; every locked level is the same
 * quiet, drained gold. So the colour on this page is information a child can
 * read at a glance — done, open, shut — and two cards the same colour mean
 * the same thing.
 *
 * The twelve were a per-level LADDER for one round (1–4 light, 5–8 base,
 * 9–12 deep) and it was reverted on direct request, for the reason worth
 * keeping: a shade tied to the level number is decoration, because nothing
 * about a card tells you which rung it is on. Colour has to carry meaning or
 * be one colour. Don't rebuild the ladder.
 */
const TONES: Record<LevelState, MemoryTone> = {
  done: GOLD,
  next: { face: "var(--color-gold-deep)", edge: "var(--color-gold-deep-dark)" },
  locked: {
    face: "var(--color-gold-quiet)",
    edge: "var(--color-gold-quiet-dark)",
  },
};

type ClayVars = CSSProperties & { "--clay-edge"?: string };
type ChipVars = CSSProperties & {
  "--chip-face"?: string;
  "--chip-edge"?: string;
};
type GlowVars = CSSProperties & { "--glow-tone"?: string };

/**
 * The twelve levels, three to a row, with the child's position in the set
 * above them.
 *
 * **Every card is gold, in one of three shades — and the shade says what the
 * card IS, not where it sits in the list** (`TONES` above): finished, next to
 * play, or locked. Gold leads this game the way green leads the puzzles.
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

    const open = previous ? starsFor(previous.value) > 0 : true;
    const done = starsFor(level.value) > 0;
    const state: LevelState = done ? "done" : open ? "next" : "locked";

    return { level, index, open, done, state };
  });

  const finished = cast.filter(({ done }) => done).length;

  /* The one level the child has actually reached: the first open one they
     have not finished. It rocks and glows, so a glance says where to tap. */
  const nextValue = cast.find(({ state }) => state === "next")?.level.value;

  return (
    <div>
      <ActivityProgress
        label="Levels"
        done={finished}
        total={levels.length}
        tone={GOLD}
      />

      <ul className="grid grid-cols-3 gap-3 sm:gap-5">
        {cast.map(({ level, index, open, done, state }) => {
          /* Done, next or locked — the only thing this card's colour says. */
          const tone = TONES[state];

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
                /* The glow rides this wrapper too, for the same reason the
                   breathe does: `.clay` owns the card's own box-shadow and a
                   second one on that element would wipe its clay shading. */
                <span
                  className="anim-breathe next-glow block"
                  style={
                    {
                      animationDelay: "1s",
                      "--glow-tone": "var(--color-gold-deep)",
                    } as GlowVars
                  }
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
