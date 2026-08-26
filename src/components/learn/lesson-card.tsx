import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { Lock, Play } from "lucide-react";
import type { Character } from "@/types/character";
import type { Lesson } from "@/types/lesson";

type TileVars = CSSProperties & { "--tile-tint"?: string };

const CARD_DELAY = 0.65;
const CARD_STAGGER = 0.12;

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
  const { accent } = character;

  /* Same rule as the home page: the pale tile is where the character's color
     lives, and locked drops most of the way to neutral without losing the hue. */
  const tileTint = locked
    ? `color-mix(in srgb, ${accent} 10%, var(--color-locked))`
    : `color-mix(in srgb, ${accent} 20%, #ffffff)`;

  const card = (
    <div
      className={`card group/lesson flex items-center gap-4 p-4 ${
        locked ? "" : "card-lift"
      }`}
    >
      <div
        className="tile relative flex h-20 w-20 shrink-0 items-center justify-center sm:h-24 sm:w-24"
        style={{ "--tile-tint": tileTint } as TileVars}
      >
        <Image
          src={image}
          alt={name}
          width={140}
          height={140}
          className={`h-14 w-14 object-contain drop-shadow-[0_8px_12px_rgba(92,78,190,0.22)] sm:h-16 sm:w-16 ${
            locked
              ? "opacity-60 grayscale-[0.55]"
              : "transition-transform duration-300 group-hover/lesson:scale-110"
          }`}
        />

        {/* Corner-mounted, not centered: at this tile size a centered badge
            covers the lesson icon completely and the card loses its subject. */}
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

      <h3
        className="min-w-0 flex-1 text-left text-base font-bold leading-snug sm:text-lg"
        style={{ color: locked ? "var(--color-locked-text)" : "var(--color-ink)" }}
      >
        {name}
      </h3>

      <span
        className="btn3d shrink-0 px-4 py-2 text-xs sm:text-sm"
        style={
          {
            "--btn-face": locked ? "var(--color-locked)" : "var(--brand)",
            "--btn-edge": locked
              ? "var(--color-locked-dark)"
              : "var(--brand-dark)",
            "--btn-text": locked ? "var(--color-locked-text)" : "#fff",
            boxShadow: locked ? "none" : undefined,
          } as CSSProperties
        }
      >
        {locked ? (
          <>
            <Lock className="h-3.5 w-3.5" strokeWidth={2.75} />
            Locked
          </>
        ) : (
          <>
            Start
            <Play className="h-3.5 w-3.5 fill-current" strokeWidth={2.75} />
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
