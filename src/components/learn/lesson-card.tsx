import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { Lock, Play } from "lucide-react";
import type { Character } from "@/types/character";
import type { Lesson } from "@/types/lesson";

type TileVars = CSSProperties & { "--tile-tint"?: string };

const CARD_DELAY = 0.65;
const CARD_STAGGER = 0.12;

/** Placeholder until the real progress store (zustand + persist, see
    CLAUDE.md's "Planned" table) exists to drive this for real — every
    lesson reads as level 0 across 5 segments for now. */
const LEVEL_SEGMENTS = 5;
const CURRENT_LEVEL = 0;

interface LessonCardProps {
  lesson: Lesson;
  /** The character hosting this lesson — supplies the card's world colors. */
  character: Character;
  /** Name of the lesson that must be finished first; locked cards only. */
  previousLessonName?: string;
  index: number;
}

export function LessonCard({
  lesson,
  character,
  previousLessonName,
  index,
}: LessonCardProps) {
  const { id, name, image, locked } = lesson;
  const { accent, accentDark } = character;

  /* Same rule as the rest of the app: the pale tile is where a character's
     color lives, and locked drops most of the way to neutral without losing
     the hue entirely. */
  const tileTint = locked
    ? `color-mix(in srgb, ${accent} 10%, var(--color-locked))`
    : `color-mix(in srgb, ${accent} 20%, #ffffff)`;

  const card = (
    <div
      className={`card card-grain group/lesson flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-6 ${
        locked ? "" : "card-lift"
      }`}
    >
      <div className="flex flex-1 items-center gap-4 sm:gap-6">
        <div
          className="tile tile-round relative flex h-20 w-20 shrink-0 items-center justify-center sm:h-24 sm:w-24"
          style={{ "--tile-tint": tileTint } as TileVars}
        >
          <Image
            src={image}
            alt={name}
            width={140}
            height={140}
            className={`h-14 w-14 object-contain drop-shadow-[0_8px_12px_rgba(92,78,190,0.22)] transition-transform duration-300 sm:h-16 sm:w-16 ${
              locked
                ? "opacity-60 grayscale-[0.55]"
                : "group-hover/lesson:scale-110"
            }`}
          />

          {/* Corner-mounted, not centered: a centered badge at this size
              would cover the lesson icon completely and the card loses its
              subject. */}
          {locked && (
            <span className="absolute -right-1.5 -top-1.5">
              <span className="group/lock relative flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-[0_8px_18px_-6px_rgb(92_78_190_/_45%)]">
                <Lock
                  className="h-3.5 w-3.5 text-[var(--color-locked-text)]"
                  strokeWidth={2.5}
                />
                {previousLessonName && (
                  <span className="pointer-events-none absolute -top-3 left-1/2 w-max max-w-[10rem] -translate-x-1/2 -translate-y-full rounded-xl bg-[var(--color-ink)] px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-all duration-200 group-hover/lock:opacity-100">
                    Finish {previousLessonName} first!
                  </span>
                )}
              </span>
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3
            className="text-lg font-bold leading-snug sm:text-xl"
            style={{ color: locked ? "var(--color-locked-text)" : "var(--color-ink)" }}
          >
            {name}
          </h3>

          {/* Level meter: a placeholder until the real progress store exists
              (see the note above) — five segments, all empty for now. */}
          <div className="mt-2.5 flex items-center gap-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-ink-soft)]">
              Level {CURRENT_LEVEL}
            </span>
            <div className="flex gap-1">
              {Array.from({ length: LEVEL_SEGMENTS }).map((_, segment) => (
                <span
                  key={segment}
                  className="h-2 w-6 rounded-full"
                  style={{
                    backgroundColor:
                      segment < CURRENT_LEVEL ? accent : "var(--color-locked)",
                  }}
                  aria-hidden
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <span
        className="btn3d w-full justify-center px-5 py-3 text-sm sm:w-auto sm:shrink-0 sm:px-6 sm:text-base"
        style={
          {
            "--btn-face": locked ? "var(--color-locked)" : accent,
            "--btn-edge": locked ? "var(--color-locked-dark)" : accentDark,
            "--btn-text": locked ? "var(--color-locked-text)" : "#fff",
            boxShadow: locked ? "none" : undefined,
          } as CSSProperties
        }
      >
        {locked ? (
          <>
            <Lock className="h-4 w-4" strokeWidth={2.75} />
            Locked
          </>
        ) : (
          <>
            Start
            <Play className="h-4 w-4 fill-current" strokeWidth={2.75} />
          </>
        )}
      </span>
    </div>
  );

  const delayStyle = { animationDelay: `${CARD_DELAY + index * CARD_STAGGER}s` };

  if (locked) {
    return (
      <div className="anim-fade-up" style={delayStyle} aria-disabled="true">
        {card}
      </div>
    );
  }

  return (
    <Link
      href={`/learn/${character.id}/${id}`}
      className="anim-fade-up block"
      style={delayStyle}
      aria-label={`Start ${name}`}
    >
      {card}
    </Link>
  );
}
