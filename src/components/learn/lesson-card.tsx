import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Lock } from "lucide-react";
import type { Character } from "@/types/character";
import type { Lesson } from "@/types/lesson";

type TileVars = CSSProperties & { "--tile-tint"?: string };

const CARD_DELAY = 0.65;
const CARD_STAGGER = 0.12;

/** Placeholder until the real progress store (zustand + persist, see
    CLAUDE.md's "Planned" table) exists to drive this for real — every
    lesson reads as 0 of its own item count for now. */
const CURRENT_ITEMS = 0;

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
  const { id, name, description, image, totalItems, locked } = lesson;
  const { accent, accentDark } = character;

  const progressPercent = Math.round((CURRENT_ITEMS / totalItems) * 100);

  const card = (
    <div
      className={`card card-grain group/lesson flex overflow-hidden ${
        locked ? "" : "card-lift"
      }`}
    >
      {/* The icon owns the card's entire left edge, full height, flush —
          not a tile floating with margin around it. Its own background is
          plain white with a soft shadow (`.tile-clay`), the same white as
          the card itself: pure claymorphism, separation from light alone,
          not a color difference. */}
      <div className="relative flex w-24 shrink-0 items-center justify-center bg-[var(--surface)] p-3 sm:w-36 sm:p-5">
        <div
          className="tile tile-clay relative flex h-full w-full items-center justify-center"
          style={{ "--tile-tint": "#ffffff" } as TileVars}
        >
          <Image
            src={image}
            alt={name}
            width={140}
            height={140}
            className={`h-11 w-11 object-contain drop-shadow-[0_8px_12px_rgba(92,78,190,0.22)] transition-transform duration-300 sm:h-20 sm:w-20 ${
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
              <span className="group/lock relative flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-[0_8px_18px_-6px_rgb(92_78_190_/_45%)]">
                <Lock
                  className="h-3 w-3 text-[var(--color-locked-text)]"
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
      </div>

      {/* Everything else — name, description, the circular indicator, and
          the progress row — lives beside the icon, not underneath it. */}
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-2.5 p-4 sm:gap-5 sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h3
              className="text-base font-bold leading-snug sm:text-2xl"
              style={{ color: locked ? "var(--color-locked-text)" : "var(--color-ink)" }}
            >
              {name}
            </h3>
            <p className="mt-0.5 truncate text-xs text-[var(--color-ink-soft)] sm:mt-1.5 sm:text-base">
              {description}
            </p>
          </div>

          {/* A decorative circular indicator, not a second control — the
              whole card is already the tappable/clickable target. Locked
              shows the lock instead of a chevron, muted and inert. */}
          <span
            className="btn3d h-10 w-10 shrink-0 sm:h-14 sm:w-14"
            style={
              {
                "--btn-face": locked ? "var(--color-locked)" : accent,
                "--btn-edge": locked ? "var(--color-locked-dark)" : accentDark,
                "--btn-text": locked ? "var(--color-locked-text)" : "#fff",
                boxShadow: locked ? "none" : undefined,
              } as CSSProperties
            }
            aria-hidden
          >
            {locked ? (
              <Lock className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.75} />
            ) : (
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.75} />
            )}
          </span>
        </div>

        {/* Progress: a placeholder until the real progress store exists (see
            the note above) — always 0 of the lesson's own item count. */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--color-locked)] sm:h-3">
            <div
              className="h-full rounded-full"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: locked ? "var(--color-locked-dark)" : accent,
              }}
              aria-hidden
            />
          </div>
          <span className="shrink-0 text-xs font-semibold text-[var(--color-ink-soft)] sm:text-sm">
            {CURRENT_ITEMS} / {totalItems}
          </span>
        </div>
      </div>
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
