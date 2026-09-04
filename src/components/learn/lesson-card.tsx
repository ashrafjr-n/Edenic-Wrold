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

/** An OPEN card's fill plus the darker companion `.clay` shades it with. */
type ClayVars = CSSProperties & { "--clay-edge"?: string };

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

  /* **The OPEN card is the coloured one.** It is the character's own accent
     with the grain (`.clay`); a LOCKED card is plain white
     (`.card-clay-white`). Both states are still clay — the same material in
     two colours — this is only which colour goes on which state, and it is
     the reverse of what it was, on direct request. Everything below that
     branches on `locked` for a COLOUR was flipped with it: leaving a chip or
     a line of type on the side it used to be on would have put white on
     white or pink on pink.

     `.clay` is the site's recipe for a COLOURED clay surface, and it is the
     right one for the accent fill: its inset highlight is gentler than
     `.card-clay-white`'s near-white one (which would blow out on a saturated
     fill) and its shade and drop shadow are mixed from `--clay-edge`, the
     fill's own darker companion, rather than the neutral shadow hue. It
     carries the grain itself, which is why no `.card-grain` sits beside it.

     `.card` sets the `background` SHORTHAND and is unlayered, so the fill has
     to come from an inline style — a Tailwind `bg-*` utility would silently
     lose. `.clay` is declared after `.card`, so its own `background-image`
     (the grain) survives that shorthand. `.card-lift` stays on the open card
     either way: it is the one that is a `Link`. */
  const card = (
    <div
      className={`card group/lesson flex h-full overflow-hidden ${
        locked ? "card-clay-white" : "clay card-lift"
      }`}
      style={
        locked
          ? undefined
          : ({
              backgroundColor: "var(--character-accent)",
              "--clay-edge": "var(--character-accent-dark)",
            } as ClayVars)
      }
    >
      {/* The art stands directly on the card — no `.tile` behind it any
          more, on request. These are full character renders rather than the
          flat subject icons that were here before, and a render boxed on its
          own panel reads as a sticker stuck to the card instead of Pinki
          standing on it; her own drop shadow is what grounds her now. */}
      {/* No padding: the art box fills the panel's whole width, so the render
          can be as large as possible without taking a single pixel from the
          text column beside it — the art's own aspect ratio (roughly 0.9)
          leaves the visual margin instead. */}
      <div className="relative flex w-20 shrink-0 items-center justify-center sm:w-36">
        <Image
          src={image}
          alt={name}
          width={220}
          height={220}
          /* The art keeps its colour even when locked, at every width.
             It used to be desaturated on a phone, back when a locked card
             was grey all through — now the accent card around it says
             "not yet" and hiding the subject as well would only take away
             the one thing worth looking forward to. */
          className={`h-20 w-20 object-contain drop-shadow-[0_8px_12px_rgba(92,78,190,0.22)] transition-transform duration-300 sm:h-36 sm:w-36 ${
            locked ? "" : "group-hover/lesson:scale-110"
          }`}
        />

        {/* Step number, tablet and up only. Below `sm` the cards are a single
            stack and the rail outside the card carries the sequence instead,
            so a number here would say the same thing twice. White on an
            OPEN card, where the lesson hue would otherwise sit on the
            character's accent and muddy both.

            Positive inset, not the negative one it carried against the tile:
            it hangs off the panel's own corner now, and the card clips
            (`overflow-hidden`) anything pushed outside it. */}
        <span
          className="absolute left-1.5 top-1.5 hidden h-7 w-7 items-center justify-center rounded-full text-xs font-bold shadow-[0_8px_18px_-6px_rgb(92_78_190_/_45%)] sm:flex"
          style={{
            backgroundColor: locked ? "var(--lesson-accent)" : "var(--surface)",
            color: locked ? "#fff" : "var(--character-accent)",
          }}
        >
          {index + 1}
        </span>
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
            {/* A WHITE pill with accent type, the same pairing
                `.counter-chip--quiet` uses — only the open card is ever
                featured, and the open card is now the accent one, so an
                accent-filled pill would have sat on its own colour (invisible
                outright below `sm`, where `--lesson-accent` IS the character
                accent). */}
            <span
              className={`mb-1.5 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide sm:text-xs ${
                featured ? "" : "invisible"
              }`}
              style={{
                backgroundColor: "var(--surface)",
                color: "var(--lesson-accent)",
              }}
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
            {/* `--lesson-muted`, not a hard-coded ink: on an OPEN card the
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

              The chip swaps materials with the card: an OPEN card IS the
              accent, so its chevron chip is white; a locked card is white, so
              its padlock chip is the accent. Either way it reads as clay on
              clay rather than as a colour laid over itself. */}
          <span
            className={`btn3d h-10 w-10 shrink-0 sm:h-12 sm:w-12 ${
              locked ? "btn3d--clay-accent" : "btn3d--clay-white"
            }`}
            aria-hidden
          >
            {locked ? (
              <Lock
                className="h-4 w-4 text-white sm:h-5 sm:w-5"
                strokeWidth={2.75}
              />
            ) : (
              <ChevronRight
                className="h-5 w-5 sm:h-6 sm:w-6"
                style={{ color: "var(--character-accent)" }}
                strokeWidth={2.75}
              />
            )}
          </span>
        </div>

        {/* A progress bar on a lesson you cannot open yet is noise — a locked
            card names what opens it instead, but still carries an item-count
            chip like every card. The two chip faces swapped with the cards:
            the pink one goes on the white (locked) card, and the white
            `--quiet` one on the accent (open) card. */}
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
            <span className="card-grain counter-chip">{totalItems}</span>
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
            <span className="counter-chip counter-chip--quiet">
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

  /* No fade on a locked card, and none was reinstated when it went white:
     it used to sit at 78% from `sm` up so it stepped back from the open ones,
     and what separates it now is that the OPEN card is the saturated one —
     a fade on top of that would only say the same thing twice. */
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
