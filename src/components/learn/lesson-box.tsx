"use client";

import { useRef, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Lock } from "lucide-react";
import { format } from "@/lib/format-dict";
import { useCourseUnlock } from "@/components/learn/use-course-unlock";
import { ClayWord } from "@/components/learn/lesson/clay-word";
import type { Dictionary } from "@/lib/dictionaries/en";
import type { BoxStop } from "@/data/courses";

interface LessonBoxProps {
  /** One title per lesson, localized. */
  titles: readonly string[];
  /** One cell per lesson, in order — `courseStops`. */
  stops: readonly BoxStop[];
  characterId: string;
  lessonId: string;
  basePath: string;
  /** The course's own colour pair — the "Start" bubble. */
  tone: { face: string; edge: string };
  dict: Dictionary["lessonPicker"];
  /** `phone`: two cells a row, down the page. `tablet` and `wide`: up to
      five a row; `wide` fills a board whose height the page sets. */
  size?: "phone" | "tablet" | "wide";
}

type Vars = CSSProperties & Record<`--${string}`, string>;

const GO = { backgroundColor: "var(--color-go)", "--clay-edge": "var(--color-go-dark)" } as Vars;

/** A lock that opened since the last visit springs off once the page has
    settled (seconds). */
const SPRING_DELAY = 0.9;

/**
 * A course's lessons as a box of things — one cell per lesson (a paint pot
 * per color, a thing per shape), the review last, across the full width. A
 * cell is EMPTY (grey clay or its picture greyed, a padlock, "?") until its
 * lesson opens; the open one shows its picture on a base in its own color
 * and a "Start" bubble; a learned one keeps its picture, its word and a green
 * tick — each standing on a clay base in its state's colour (`.art-stage`).
 * Collecting them is the progress — no map: the lessons have no
 * "road" between them, they fill a box.
 *
 * Coming back after lessons have opened, the next one's padlock springs
 * off as it colours in (`useCourseUnlock`).
 */
export function LessonBox({ titles, stops, characterId, lessonId, basePath, tone, dict, size = "phone" }: LessonBoxProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLAnchorElement>(null);
  const count = titles.length;
  const { stars, nextIndex, unlocking } = useCourseUnlock({
    characterId,
    lessonId,
    count,
    rootRef,
    nextRef,
    scroll: size !== "wide",
  });

  const wide = size === "wide";
  /* The one-word lessons fill even rows (ten colors: two rows of five;
     four shapes: one row on a tablet, two of two on the board, where one
     row would stand them tall and thin); the review takes a row of its own. */
  const singles = stops.filter((stop) => !stop.review).length;
  const cols = size === "phone" ? 2 : singles > 5 || wide ? Math.ceil(singles / 2) : singles;
  const rows = Math.ceil(singles / cols);
  const gridStyle: CSSProperties = {
    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
    ...(wide ? { gridTemplateRows: `repeat(${rows}, minmax(0, 1fr)) auto` } : {}),
  };

  return (
    <div ref={rootRef} className={`grid w-full gap-4 ${wide ? "h-full xl:gap-5" : ""}`} style={gridStyle}>
      {titles.map((title, i) => {
        const n = i + 1;
        const stop = stops[i];
        const done = stars[i] > 0;
        const isNext = i === nextIndex;
        const locked = !done && !isNext;
        const springing = i === unlocking;
        const review = stop.review === true;

        /* The thing stands on a clay base and rises above it; the base's
           colour says where the lesson is: the next one in its colour, a
           learned one pale, a locked one dormant lavender. */
        const hue = stop.ring ?? tone.face;
        const tint = locked
          ? "color-mix(in srgb, var(--color-locked-dark) 45%, var(--surface))"
          : `color-mix(in srgb, ${hue} ${isNext ? 45 : 20}%, var(--surface))`;
        const art = (
          <span
            className={`art-stage flex items-center justify-center ${review ? "gap-[4%]" : ""} ${wide ? "min-h-0 w-full flex-1" : "w-full"}`}
            style={{ "--stage-tint": tint, "--stage-inset": review ? "45% 0 -6% 0" : "45% 4% -6% 4%" } as Vars}
          >
            {stop.pictures.map((picture) => (
              <span key={picture.src} className={`relative block aspect-square ${review ? "h-full max-h-20 w-[22%]" : wide ? "h-full max-w-[78%]" : "w-[66%]"}`}>
                {/* Under it, what a locked cell shows: the blank (an empty
                    pot), else the picture itself, greyed. */}
                <Image
                  src={stop.blank ?? picture}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 10rem, 7rem"
                  className={`object-contain ${stop.blank ? "" : "path-art-locked"}`}
                />
                {!locked && (
                  <Image
                    src={picture}
                    alt=""
                    fill
                    loading="eager"
                    sizes="(min-width: 1024px) 10rem, 7rem"
                    className={`object-contain ${springing ? "paint-reveal" : ""}`}
                    style={springing ? { animationDelay: `${SPRING_DELAY + 0.1}s` } : undefined}
                  />
                )}
              </span>
            ))}
          </span>
        );

        /* A review, or a lesson not written yet (no word to keep secret),
           is labelled by its title. */
        const label = review || (!locked && stop.word === undefined) ? (
          <span className={`font-bold leading-tight ${locked ? "text-[var(--color-ink-soft)]" : "text-[var(--color-ink)]"} ${wide ? "text-lg" : "text-base"}`}>
            {title}
          </span>
        ) : locked || stop.word === undefined ? (
          /* A word still to learn keeps its name a secret. */
          <span className={`font-bold text-[var(--color-ink-soft)] ${wide ? "text-3xl" : "text-2xl"}`} aria-hidden>
            ?
          </span>
        ) : (
          <span className={`${wide ? "[&>span]:text-[min(2.25rem,4.5svh)]" : "[&>span]:text-3xl"}`}>
            <ClayWord word={stop.word} size="sm" tone={stop.letter} />
          </span>
        );

        const cell = (
          <>
            {isNext && (
              <span
                className="path-bubble card card-clay-white card-pill anim-breathe absolute -top-3 left-1/2 z-10 whitespace-nowrap px-4 py-1 text-sm font-bold uppercase tracking-wide"
                style={{ color: tone.edge, translate: "-50% 0" }}
              >
                {dict.ctaStart}
              </span>
            )}
            {art}
            {label}
            {done && (
              <span
                className="clay absolute -right-1.5 -top-1.5 flex h-8 w-8 items-center justify-center rounded-full"
                style={GO}
              >
                <Check className="h-4 w-4 text-white" strokeWidth={3.25} />
              </span>
            )}
            {(locked || springing) && (
              <span
                className={`lock-chip absolute -bottom-1.5 -right-1.5 h-8 w-8 ${springing ? "path-lock-off" : ""}`}
                style={springing ? { animationDelay: `${SPRING_DELAY}s` } : undefined}
              >
                <Lock className="h-3.5 w-3.5" strokeWidth={2.75} />
              </span>
            )}
          </>
        );

        const cellClass = `card card-clay-white relative flex min-h-0 flex-col items-center justify-center gap-1 ${
          review ? `col-span-full ${wide ? "flex-row gap-6 px-6 py-3" : size === "phone" ? "px-4 py-4" : "flex-row gap-6 px-6 py-4"}` : `px-2 pb-3 pt-4 ${wide ? "" : "aspect-[5/6]"}`
        } ${springing ? "anim-jump" : "anim-rise-in"} ${locked ? "" : "hover:outline-4 hover:outline-offset-4 hover:outline-[color-mix(in_srgb,var(--page-accent-color)_45%,transparent)]"}`;
        const style: Vars = {
          animationDelay: springing ? `${SPRING_DELAY + 0.2}s` : `${0.1 + i * 0.05}s`,
        };

        return locked ? (
          <span key={n} className={cellClass} style={style} aria-label={format(dict.lockedLessonAria, { n, title })}>
            {cell}
          </span>
        ) : (
          <Link
            key={n}
            ref={isNext ? nextRef : undefined}
            href={`${basePath}/${n}`}
            className={cellClass}
            style={style}
            aria-label={format(dict.startLessonAria, { n, title })}
          >
            {cell}
          </Link>
        );
      })}
    </div>
  );
}
