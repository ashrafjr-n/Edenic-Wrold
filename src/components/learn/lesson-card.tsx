import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Lock } from "lucide-react";
import type { Character } from "@/types/character";
import type { Lesson } from "@/types/lesson";

type ThemeVars = CSSProperties & {
  "--lesson-hue"?: string;
  "--lesson-hue-dark"?: string;
  "--lesson-hue-soft"?: string;
};

const CARD_DELAY = 0.65;
const CARD_STAGGER = 0.12;

/** Placeholder until the real progress store (zustand + persist, see
    CLAUDE.md's "Planned" table) exists — every lesson reads as untouched. */
const CURRENT_ITEMS = 0;

/** How this card sits on the phone-only progress rail. Grouped into one prop
    so the component doesn't grow four more positional booleans. */
export interface LessonRail {
  /** Last lesson in the list — the track stops at this node. */
  isLast: boolean;
  /** The segment arriving at this node is lit (this lesson is reachable). */
  aboveActive: boolean;
  /** The segment leaving this node is lit (the next lesson is reachable). */
  belowActive: boolean;
}

interface LessonCardProps {
  lesson: Lesson;
  /** The character hosting this lesson — supplies the card's world colors. */
  character: Character;
  /** Name of the lesson that must be finished first; locked cards only. */
  previousLessonName?: string;
  /** Marks the lesson to do next. Adds a badge only — never a size change. */
  featured?: boolean;
  rail: LessonRail;
  index: number;
}

export function LessonCard({
  lesson,
  character,
  previousLessonName,
  featured = false,
  rail,
  index,
}: LessonCardProps) {
  const { id, name, description, image, theme, totalItems, locked } = lesson;
  const { accent } = character;

  const progressPercent = Math.round((CURRENT_ITEMS / totalItems) * 100);
  const isFirst = index === 0;

  /* The rail's lit color stays the CHARACTER's accent, not the lesson's:
     below `sm` the lesson hues are switched off (see `.lesson-theme`), and
     the rail is phone-only anyway. */
  const litTrack = accent;
  const dimTrack = "var(--color-locked)";

  /* Which piece of the adventure trail leaves this card. One column
     (tablet) always runs straight down; two columns (desktop) run across
     the gap from the left-hand card and hook down-and-back from the
     right-hand one. Nothing leaves the last card. */
  const hasNext = !rail.isLast;
  const isLeftColumn = index % 2 === 0;

  const card = (
    <div
      className={`card card-grain group/lesson flex h-full overflow-hidden ${
        locked ? "" : "card-lift"
      }`}
    >
      {/* The icon owns the card's entire left edge, full height, flush — not a
          tile floating with margin around it. White on a phone (separation
          from light alone); from `sm` up it takes the lesson's own pale tint,
          which is what makes the four subjects read apart at a glance. */}
      <div className="relative flex w-20 shrink-0 items-center justify-center bg-[var(--surface)] p-3 sm:w-36 sm:p-4">
        <div
          className="tile tile-grain tile-clay relative flex h-full w-full items-center justify-center"
          style={{ "--tile-tint": "var(--lesson-tile)" } as CSSProperties}
        >
          <Image
            src={image}
            alt={name}
            width={140}
            height={140}
            className={`h-11 w-11 object-contain drop-shadow-[0_8px_12px_rgba(92,78,190,0.22)] transition-transform duration-300 sm:h-20 sm:w-20 ${
              locked
                ? /* Desaturated on the phone, where locked reads as grey all
                     through. From `sm` up the card fades instead and the icon
                     keeps its color — the point there is to show the world
                     ahead, not to hide it. */
                  "opacity-60 grayscale-[0.55] sm:opacity-100 sm:grayscale-0"
                : "group-hover/lesson:scale-110"
            }`}
          />

          {/* Step number, tablet and up only. Below `sm` the cards are a single
              stack and the rail outside the card carries the sequence instead,
              so a number here would say the same thing twice. */}
          <span
            className="absolute -left-1.5 -top-1.5 hidden h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white shadow-[0_8px_18px_-6px_rgb(92_78_190_/_45%)] sm:flex"
            style={{ backgroundColor: "var(--lesson-accent)" }}
          >
            {index + 1}
          </span>
        </div>
      </div>

      {/* Name, description, indicator and status all sit beside the icon —
          never stacked underneath it. */}
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-2.5 p-4 sm:gap-3 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            {featured && (
              <span
                className="mb-1.5 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white sm:text-xs"
                style={{ backgroundColor: "var(--lesson-accent)" }}
              >
                Next up
              </span>
            )}

            <h3
              className="text-base font-bold leading-snug sm:text-xl"
              style={{ color: "var(--lesson-title)" }}
            >
              {name}
            </h3>
            <p className="mt-0.5 truncate text-xs text-[var(--color-ink-soft)] sm:mt-1 sm:text-sm">
              {description}
            </p>
          </div>

          {/* Decorative, not a second control — the whole card is already the
              tappable target. It is also the card's only lock. */}
          <span
            className="btn3d lesson-chip h-10 w-10 shrink-0 sm:h-12 sm:w-12"
            style={
              {
                "--btn-face": "var(--lesson-accent)",
                "--btn-edge": "var(--lesson-accent-dark)",
                "--btn-text": "var(--lesson-chip-text)",
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

        {/* A progress bar on a lesson you cannot open yet is noise — a locked
            card names what opens it instead. */}
        {locked ? (
          <p
            className="text-xs font-semibold sm:text-sm"
            style={{ color: "var(--lesson-muted)" }}
          >
            {previousLessonName
              ? `Unlocks after ${previousLessonName}`
              : "Unlocks later"}
          </p>
        ) : (
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--color-locked)] sm:h-2.5">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: "var(--lesson-accent)",
                }}
                aria-hidden
              />
            </div>
            <span className="shrink-0 text-xs font-semibold text-[var(--color-ink-soft)] sm:text-sm">
              {CURRENT_ITEMS} / {totalItems}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  /* Phone-only progress rail. The cards are one stack below `sm`, so the path
     between them can be drawn literally: a silver track with the accent
     travelling along it, one node per lesson. The lit length is the answer to
     "how far have I got", which is exactly what the numbers say on wider
     screens. The lane it sits in comes from the grid's extra left padding. */
  const railColumn = (
    <div className="absolute -left-9 top-0 bottom-0 w-9 sm:hidden" aria-hidden>
      {/* Deliberately square-ended. Every segment terminus is either covered
          by a node chip or butts against the next card's segment, so rounded
          caps only produced a visible pinch at each join. */}
      {!isFirst && (
        <span
          className="absolute left-1/2 top-0 h-1/2 w-1 -translate-x-1/2"
          style={{ backgroundColor: rail.aboveActive ? litTrack : dimTrack }}
        />
      )}

      {!rail.isLast && (
        <span
          className="absolute left-1/2 top-1/2 -bottom-5 w-1 -translate-x-1/2"
          style={{ backgroundColor: rail.belowActive ? litTrack : dimTrack }}
        />
      )}

      {/* White chip around the dot so the node reads against both the track
          and the saturated page behind it. */}
      <span className="absolute left-1/2 top-1/2 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0_6px_14px_-4px_rgb(92_78_190_/_45%)]">
        <span
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: locked ? dimTrack : litTrack }}
        />
      </span>
    </div>
  );

  /* The white clay road on to the next lesson. Sits behind the cards
     (`.trail` is `z-index: -1`, inside the wrapper's own stacking context),
     so the tuck under each card edge closes the join without a seam.
     Geometry lives entirely in `globals.css`. */
  const trail = hasNext && (
    <>
      {/* One column: tablet only — below `sm` the rail above does this job. */}
      <div className="trail trail-down hidden sm:block lg:hidden" aria-hidden>
        <span />
      </div>

      {isLeftColumn ? (
        <div className="trail trail-across hidden lg:block" aria-hidden>
          <span />
        </div>
      ) : (
        <div className="trail trail-hook hidden lg:block" aria-hidden>
          <span />
          <span />
          <span />
        </div>
      )}
    </>
  );

  /* `isolate` keeps the trail's negative z-index inside this wrapper: without
     a stacking context here it would slide behind the page background and
     disappear. */
  const wrapperClass = `lesson-theme anim-fade-up relative isolate ${
    locked ? "is-locked sm:opacity-[0.72]" : ""
  }`;

  const wrapperStyle = {
    animationDelay: `${CARD_DELAY + index * CARD_STAGGER}s`,
    "--lesson-hue": theme.accent,
    "--lesson-hue-dark": theme.accentDark,
    "--lesson-hue-soft": theme.soft,
  } as ThemeVars;

  if (locked) {
    return (
      <div className={wrapperClass} style={wrapperStyle} aria-disabled="true">
        {trail}
        {railColumn}
        {card}
      </div>
    );
  }

  return (
    <Link
      href={`/learn/${character.id}/${id}`}
      className={`${wrapperClass} block`}
      style={wrapperStyle}
      aria-label={`Start ${name}`}
    >
      {trail}
      {railColumn}
      {card}
    </Link>
  );
}
