import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Lock } from "lucide-react";
import type { Character } from "@/types/character";
import type { Lesson } from "@/types/lesson";

type ThemeVars = CSSProperties & {
  "--lesson-hue"?: string;
  "--lesson-hue-dark"?: string;
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
  /* A pale wash of the character's own accent rather than the neutral locked
     grey — the same move the cards just made, so the rail reads as one path
     that has not been walked yet instead of a silver one. */
  const dimTrack = `color-mix(in srgb, ${accent} 28%, #ffffff)`;

  /* Open cards are white clay. A LOCKED one wears the character's own accent
     with the site's grain over it — the same `.card` + inline fill +
     `.card-grain` recipe the puzzle stage cards use, and the reason nothing
     here has to be greyed out any more: the colour says "not yet" on its own,
     louder and friendlier than a silver card ever did. `.card` sets the
     `background` SHORTHAND and is unlayered, so the fill has to come from an
     inline style — a Tailwind `bg-*` utility would silently lose. */
  const card = (
    <div
      className={`card group/lesson flex h-full overflow-hidden ${
        locked ? "card-grain" : "card-clay-white card-lift"
      }`}
      style={
        locked
          ? ({ backgroundColor: "var(--character-accent)" } as CSSProperties)
          : undefined
      }
    >
      {/* Plain white — on an open card that is the same white as the card
          behind it, separated by the tile's own shadow rather than by colour;
          on a locked one it is the window through the accent that keeps the
          lesson's icon readable. */}
      <div className="relative flex w-20 shrink-0 items-center justify-center p-3 sm:w-36 sm:p-4">
        <div
          className="tile tile-clay relative flex h-full w-full items-center justify-center"
          style={{ "--tile-tint": "var(--surface)" } as CSSProperties}
        >
          <Image
            src={image}
            alt={name}
            width={140}
            height={140}
            /* The icon keeps its colour even when locked, at every width.
               It used to be desaturated on a phone, back when a locked card
               was grey all through — now the accent card around it says
               "not yet" and hiding the subject as well would only take away
               the one thing worth looking forward to. */
            className={`h-11 w-11 object-contain drop-shadow-[0_8px_12px_rgba(92,78,190,0.22)] transition-transform duration-300 sm:h-20 sm:w-20 ${
              locked ? "" : "group-hover/lesson:scale-110"
            }`}
          />

          {/* Step number, tablet and up only. Below `sm` the cards are a single
              stack and the rail outside the card carries the sequence instead,
              so a number here would say the same thing twice. White on a
              locked card, where the lesson hue would otherwise sit on the
              character's accent and muddy both. */}
          <span
            className="absolute -left-1.5 -top-1.5 hidden h-7 w-7 items-center justify-center rounded-full text-xs font-bold shadow-[0_8px_18px_-6px_rgb(92_78_190_/_45%)] sm:flex"
            style={{
              backgroundColor: locked ? "var(--surface)" : "var(--lesson-accent)",
              color: locked ? "var(--character-accent)" : "#fff",
            }}
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
            {/* Always rendered, just hidden when not featured — reserving the
                same space on every card. Conditionally rendering this
                (instead of hiding it) was what made the "Next up" card taller
                than the rest despite the "adds a badge only, never a size
                change" rule below. */}
            <span
              className={`mb-1.5 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white sm:text-xs ${
                featured ? "" : "invisible"
              }`}
              style={{ backgroundColor: "var(--lesson-accent)" }}
              aria-hidden={!featured}
            >
              Next up
            </span>

            <h3
              className="text-base font-bold leading-snug sm:text-xl"
              style={{ color: "var(--lesson-title)" }}
            >
              {name}
            </h3>
            {/* `--lesson-muted`, not a hard-coded ink: on a locked card the
                body is the accent and this has to come back as white. */}
            <p
              className="mt-0.5 truncate text-xs sm:mt-1 sm:text-sm"
              style={{ color: "var(--lesson-muted)" }}
            >
              {description}
            </p>
          </div>

          {/* Decorative, not a second control — the whole card is already the
              tappable target. It is also the card's only lock.

              The chip swaps materials with the card: an open card is white,
              so its chevron chip is the accent; a locked card IS the accent,
              so its padlock chip is white. Either way it reads as clay on
              clay rather than as a colour laid over itself. */}
          <span
            className={`btn3d h-10 w-10 shrink-0 sm:h-12 sm:w-12 ${
              locked ? "btn3d--clay-white" : "btn3d--clay-accent"
            }`}
            aria-hidden
          >
            {locked ? (
              <Lock
                className="h-4 w-4 sm:h-5 sm:w-5"
                style={{ color: "var(--character-accent)" }}
                strokeWidth={2.75}
              />
            ) : (
              <ChevronRight
                className="h-5 w-5 text-white sm:h-6 sm:w-6"
                strokeWidth={2.75}
              />
            )}
          </span>
        </div>

        {/* A progress bar on a lesson you cannot open yet is noise — a locked
            card names what opens it instead, but still carries the same pink
            item-count chip every card gets now. */}
        {locked ? (
          <div className="flex items-center justify-between gap-3">
            <p
              className="min-w-0 truncate text-xs font-semibold sm:text-sm"
              style={{ color: "var(--lesson-muted)" }}
            >
              {previousLessonName
                ? `Unlocks after ${previousLessonName}`
                : "Unlocks later"}
            </p>
            <span className="counter-chip counter-chip--quiet">
              {totalItems}
            </span>
          </div>
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
            <span className="card-grain counter-chip">
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

  /* No fade on a locked card any more. It used to sit at 78% from `sm` up so
     it stepped back from the open ones; now that its body is a saturated
     accent, fading it only washed the colour out — the white type and the
     padlock chip are what separate it from a card you can open. */
  const wrapperClass = `lesson-theme anim-fade-up relative ${
    locked ? "is-locked" : ""
  }`;

  const wrapperStyle = {
    animationDelay: `${CARD_DELAY + index * CARD_STAGGER}s`,
    "--lesson-hue": theme.accent,
    "--lesson-hue-dark": theme.accentDark,
  } as ThemeVars;

  if (locked) {
    return (
      <div className={wrapperClass} style={wrapperStyle} aria-disabled="true">
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
      {railColumn}
      {card}
    </Link>
  );
}
