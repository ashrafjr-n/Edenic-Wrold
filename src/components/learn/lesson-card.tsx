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
    CLAUDE.md's "Planned" table) exists — every lesson reads as untouched. */
const CURRENT_ITEMS = 0;

interface LessonCardProps {
  lesson: Lesson;
  /** The character hosting this lesson — supplies the card's world colors. */
  character: Character;
  /** Name of the lesson that must be finished first; locked cards only. */
  previousLessonName?: string;
  /** The lesson to lead with: rendered larger, full-width, badged "Next up". */
  featured?: boolean;
  index: number;
}

export function LessonCard({
  lesson,
  character,
  previousLessonName,
  featured = false,
  index,
}: LessonCardProps) {
  const { id, name, description, image, totalItems, locked } = lesson;
  const { accent, accentDark } = character;

  /* An empty bar on every card is what made a first visit read as
     "unfinished". The bar only appears once there is something to show;
     before that the same slot carries the lesson's size instead. */
  const started = CURRENT_ITEMS > 0;
  const progressPercent = Math.round((CURRENT_ITEMS / totalItems) * 100);

  /* The featured lesson is the page's one call to action, so it carries real
     size over the locked ones rather than sitting at equal weight. */
  const layout = featured
    ? {
        panel: "w-24 p-3 sm:w-44 sm:p-6",
        icon: "h-14 w-14 sm:h-24 sm:w-24",
        body: "gap-3 p-4 sm:gap-5 sm:p-8",
        title: "text-lg sm:text-3xl",
        /* The hero card gets room to wrap rather than truncating — at phone
           width a single clipped line ("Learn numbers 1…") says nothing. */
        description: "text-sm sm:text-lg",
        indicator: "h-11 w-11 sm:h-16 sm:w-16",
        indicatorIcon: "h-5 w-5 sm:h-8 sm:w-8",
      }
    : {
        panel: "w-24 p-3 sm:w-32 sm:p-4",
        icon: "h-11 w-11 sm:h-16 sm:w-16",
        body: "gap-2.5 p-4 sm:gap-3 sm:p-5",
        title: "text-base sm:text-xl",
        description: "truncate text-xs sm:text-sm",
        indicator: "h-10 w-10 sm:h-12 sm:w-12",
        indicatorIcon: "h-5 w-5 sm:h-6 sm:w-6",
      };

  const card = (
    <div
      className={`card card-grain group/lesson flex h-full overflow-hidden ${
        locked ? "" : "card-lift"
      }`}
    >
      {/* The icon owns the card's entire left edge, full height, flush —
          not a tile floating with margin around it. Its own background is
          plain white with a soft shadow (`.tile-clay`), the same white as
          the card itself: pure claymorphism, separation from light alone,
          not a color difference. */}
      <div
        className={`relative flex shrink-0 items-center justify-center bg-[var(--surface)] ${layout.panel}`}
      >
        <div
          className="tile tile-clay relative flex h-full w-full items-center justify-center"
          style={{ "--tile-tint": "#ffffff" } as TileVars}
        >
          <Image
            src={image}
            alt={name}
            width={140}
            height={140}
            className={`object-contain drop-shadow-[0_8px_12px_rgba(92,78,190,0.22)] transition-transform duration-300 ${
              layout.icon
            } ${
              locked
                ? "opacity-60 grayscale-[0.55]"
                : "group-hover/lesson:scale-110"
            }`}
          />

          {/* Step number. Two columns at `lg` make the reading order
              left-to-right-then-down, which is not obviously the lesson
              order — the number says it outright. It sits where the lock
              badge used to: that lock was a duplicate of the one in the
              indicator, and one lock per card is enough. */}
          <span
            className="absolute -left-1.5 -top-1.5 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shadow-[0_8px_18px_-6px_rgb(92_78_190_/_45%)]"
            style={{
              backgroundColor: locked ? "var(--color-locked)" : accent,
              color: locked ? "var(--color-locked-text)" : "#fff",
            }}
          >
            {index + 1}
          </span>
        </div>
      </div>

      {/* Everything else — name, description, the circular indicator, and
          the status row — lives beside the icon, not underneath it. */}
      <div
        className={`flex min-w-0 flex-1 flex-col justify-center ${layout.body}`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            {featured && (
              <span
                className="mb-1.5 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white sm:mb-2 sm:text-xs"
                style={{ backgroundColor: accent }}
              >
                Next up
              </span>
            )}

            <h3
              className={`font-bold leading-snug ${layout.title}`}
              style={{
                color: locked ? "var(--color-locked-text)" : "var(--color-ink)",
              }}
            >
              {name}
            </h3>
            <p
              className={`mt-0.5 text-[var(--color-ink-soft)] sm:mt-1.5 ${layout.description}`}
            >
              {description}
            </p>
          </div>

          {/* A decorative indicator, not a second control — the whole card is
              already the tappable/clickable target. It is also the card's
              only lock now. */}
          <span
            className={`btn3d shrink-0 ${layout.indicator}`}
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
              <Lock className={layout.indicatorIcon} strokeWidth={2.75} />
            ) : (
              <ChevronRight className={layout.indicatorIcon} strokeWidth={2.75} />
            )}
          </span>
        </div>

        {/* A progress bar on a lesson you cannot open yet is noise — a locked
            card says what opens it instead. */}
        {locked ? (
          <p className="text-xs font-semibold text-[var(--color-locked-text)] sm:text-sm">
            {previousLessonName
              ? `Unlocks after ${previousLessonName}`
              : "Unlocks later"}
          </p>
        ) : started ? (
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--color-locked)] sm:h-3">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: accent,
                }}
                aria-hidden
              />
            </div>
            <span className="shrink-0 text-xs font-semibold text-[var(--color-ink-soft)] sm:text-sm">
              {CURRENT_ITEMS} / {totalItems}
            </span>
          </div>
        ) : (
          <p className="text-xs font-semibold text-[var(--color-ink-soft)] sm:text-sm">
            {totalItems} activities
          </p>
        )}
      </div>
    </div>
  );

  const delayStyle = { animationDelay: `${CARD_DELAY + index * CARD_STAGGER}s` };
  const span = featured ? "lg:col-span-2" : "";

  if (locked) {
    return (
      <div
        className={`anim-fade-up ${span}`}
        style={delayStyle}
        aria-disabled="true"
      >
        {card}
      </div>
    );
  }

  return (
    <Link
      href={`/learn/${character.id}/${id}`}
      className={`anim-fade-up block ${span}`}
      style={delayStyle}
      aria-label={`Start ${name}`}
    >
      {card}
    </Link>
  );
}
