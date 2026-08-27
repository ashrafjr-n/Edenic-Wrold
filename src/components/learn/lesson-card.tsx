import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { Lock, Play } from "lucide-react";
import type { Character } from "@/types/character";
import type { Lesson } from "@/types/lesson";

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
  const { accent, accentDark } = character;

  /* No tile box behind the icon any more — a soft blurred color pool stands
     in for it, the same atmospheric language the contact shadows elsewhere
     already use. Locked drops most of the way to neutral without losing the
     hue entirely. */
  const iconGlow = locked
    ? `color-mix(in srgb, ${accent} 8%, transparent)`
    : `color-mix(in srgb, ${accent} 32%, transparent)`;

  const card = (
    <div
      className={`card card-grain group/lesson relative p-5 pr-7 sm:p-6 sm:pr-9 ${
        locked ? "" : "card-lift"
      }`}
    >
      <div className="min-w-0 pr-16 sm:pr-20">
        <h3
          className="text-base font-bold leading-snug sm:text-lg"
          style={{ color: locked ? "var(--color-locked-text)" : "var(--color-ink)" }}
        >
          {name}
        </h3>

        {/* Level track: a placeholder until the real progress store (zustand
            + persist, see CLAUDE.md's "Planned" table) exists — every lesson
            reads as level 0 for now. */}
        <div className="mt-4 h-3 w-full max-w-[13rem] overflow-hidden rounded-full bg-[var(--color-locked)] sm:mt-5">
          <div
            className="h-full w-0 rounded-full"
            style={{ backgroundColor: locked ? "var(--color-locked-dark)" : accent }}
            aria-hidden
          />
        </div>
      </div>

      {/* The icon straddles the card's own right edge — half in, half out —
          the same "breaks the frame" language the character portraits use
          on their tiles elsewhere in the app, just mirrored to this row. */}
      <div className="absolute right-0 top-1/2 h-24 w-24 -translate-y-1/2 translate-x-1/2 sm:h-28 sm:w-28">
        <div
          className="absolute inset-1 rounded-full blur-2xl"
          style={{ backgroundColor: iconGlow }}
          aria-hidden
        />

        <Image
          src={image}
          alt={name}
          width={140}
          height={140}
          className={`relative h-20 w-20 object-contain drop-shadow-[0_10px_16px_rgba(92,78,190,0.24)] transition-transform duration-300 sm:h-24 sm:w-24 ${
            locked
              ? "opacity-60 grayscale-[0.55]"
              : "group-hover/lesson:scale-105"
          }`}
        />

        {/* Corner-mounted, not centered: a centered badge at this size would
            cover the lesson icon completely and the card loses its subject. */}
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

      {/* Hover reveal: the Start pill lands in the middle of the whole card,
          not tucked into a corner — mouse-only affordance, since the whole
          row is already a tappable Link for touch. */}
      {!locked && (
        <span
          className="btn3d pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-5 py-2.5 text-sm opacity-0 transition-opacity duration-200 group-hover/lesson:opacity-100"
          style={
            {
              "--btn-face": accent,
              "--btn-edge": accentDark,
              "--btn-text": "#fff",
            } as CSSProperties
          }
        >
          Start
          <Play className="h-4 w-4 fill-current" strokeWidth={2.75} />
        </span>
      )}
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
