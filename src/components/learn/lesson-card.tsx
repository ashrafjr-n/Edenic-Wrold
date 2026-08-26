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
  const { accent, accentSoft, accentDark } = character;

  /* Locked cards drop the gold hairline and the hover lift entirely, so
     they read as inert before the label is even read. */
  const cardClasses = `group/lesson relative flex w-full flex-col items-center rounded-[2rem] pb-6 pt-14 text-center ${
    locked ? "bg-[var(--color-locked)]/50" : "lesson-card"
  }`;

  const cardStyle: CSSProperties | undefined = locked
    ? undefined
    : ({
        backgroundImage: `linear-gradient(180deg, #ffffff 45%, ${accentSoft} 100%)`,
        "--card-edge": accentDark,
      } as CSSProperties);

  const pillVars = {
    "--btn-face": locked ? "var(--color-locked)" : accent,
    "--btn-edge": locked ? "var(--color-locked-dark)" : accentDark,
    "--btn-text": locked ? "var(--color-locked-text)" : "#fff",
  } as CSSProperties;

  const card = (
    <div className={cardClasses} style={cardStyle}>
      {/* Icon sits half above the card's top edge, half inside — centered on
          the border, not merely overlapping it. */}
      <div className="absolute -top-11 left-1/2 z-10 -translate-x-1/2 sm:-top-12">
        <Image
          src={image}
          alt={name}
          width={140}
          height={140}
          className={`h-24 w-24 object-contain drop-shadow-[0_10px_14px_rgba(59,36,101,0.22)] sm:h-28 sm:w-28 ${
            locked
              ? "opacity-60 grayscale"
              : "-rotate-6 transition-transform duration-300 group-hover/lesson:rotate-0 group-hover/lesson:scale-110"
          }`}
        />

        {locked && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="group/lock relative flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-[0_6px_16px_-4px_rgba(59,36,101,0.3)]">
              <Lock
                className="h-5 w-5 text-[var(--color-locked-text)]"
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
        className="mt-2 px-3 text-lg font-bold sm:text-xl"
        style={{ color: locked ? "var(--color-locked-text)" : "var(--color-ink)" }}
      >
        {name}
      </h3>

      {!locked && (
        <Image
          src={character.image}
          alt={character.name}
          width={475}
          height={539}
          className="pointer-events-none absolute -bottom-3 -right-2 h-16 w-auto -rotate-6 object-contain drop-shadow-[0_6px_10px_rgba(59,36,101,0.18)] transition-transform duration-300 group-hover/lesson:rotate-0 sm:h-20"
        />
      )}

      <span
        className={`btn3d ${locked ? "btn3d--calm" : ""} mt-7 px-5 py-2 text-xs sm:text-sm`}
        style={pillVars}
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
