"use client";

import { useRef, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Lock } from "lucide-react";
import { format } from "@/lib/format-dict";
import { useCourseUnlock } from "@/components/learn/use-course-unlock";
import type { Dictionary } from "@/lib/dictionaries/en";
import type { BoxStop } from "@/data/courses";

interface BoardLessonsProps {
  /** One title per lesson, localized. */
  titles: readonly string[];
  /** One cell per lesson, in order — `courseStops`. */
  stops: readonly BoxStop[];
  characterId: string;
  lessonId: string;
  basePath: string;
  dict: Dictionary["lessonPicker"];
  dir: "rtl" | "ltr";
}

/** A lock that opened since the last visit springs off once the board has
    settled (seconds). */
const SPRING_DELAY = 1.1;

/**
 * A course's lessons written up on Pinki's board (2026-10-14, her course
 * pages): a chalk box per lesson, its thing held up by a clay magnet.
 * The rules are `LessonBox`'s — a learned lesson keeps its thing, its word
 * and a tick; the next one is lit, with "Start"; one still locked is
 * dimmed, its word a "?" (a colour shows an empty pot); the review takes a
 * row of its own; a lock that opened since the last visit springs off.
 */
export function BoardLessons({ titles, stops, characterId, lessonId, basePath, dict, dir }: BoardLessonsProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLAnchorElement>(null);
  const { stars, nextIndex, unlocking } = useCourseUnlock({
    characterId,
    lessonId,
    count: titles.length,
    rootRef,
    nextRef,
    scroll: true,
  });
  const singles = stops.filter((stop) => !stop.review).length;
  const cols = singles > 5 ? Math.ceil(singles / 2) : singles;

  return (
    <div
      ref={rootRef}
      className="board-lessons"
      style={{ "--cols": cols, "--rows": Math.ceil(singles / cols) } as CSSProperties}
    >
      {titles.map((title, i) => {
        const n = i + 1;
        const stop = stops[i];
        const done = stars[i] > 0;
        const isNext = i === nextIndex;
        const locked = !done && !isNext;
        const springing = i === unlocking;
        const review = stop.review === true;
        /* A word still to learn keeps its name a secret; a review is
           labelled by its title. */
        const label = review || stop.word === undefined ? title : locked ? "?" : stop.word;

        const cell = (
          <>
            <span className={`board-cell-art ${review ? "board-cell-art--row" : ""}`}>
              {stop.pictures.map((picture) => (
                <span key={picture.src} className="board-magnet">
                  <Image
                    src={locked && stop.blank ? stop.blank : picture}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 9rem, 6rem"
                    className={`object-contain ${springing ? "paint-reveal" : ""}`}
                    style={springing ? { animationDelay: `${SPRING_DELAY + 0.1}s` } : undefined}
                  />
                </span>
              ))}
            </span>
            <span dir={dir} className="board-cell-word">{label}</span>
            {isNext && <span className="board-cell-start">{dict.ctaStart}</span>}
            {done && (
              <span className="board-cell-tick" aria-hidden>
                <Check className="h-4 w-4" strokeWidth={3.25} />
              </span>
            )}
            {(locked || springing) && (
              <span
                className={`board-cell-lock ${springing ? "path-lock-off" : ""}`}
                style={springing ? { animationDelay: `${SPRING_DELAY}s` } : undefined}
                aria-hidden
              >
                <Lock className="h-3.5 w-3.5" strokeWidth={2.75} />
              </span>
            )}
          </>
        );

        const className = `board-cell ${review ? "board-cell--review" : ""} ${isNext ? "board-cell--next" : ""} ${locked ? "board-cell--locked" : ""}`;
        const style = { animationDelay: `${0.35 + i * 0.05}s` };
        return locked ? (
          <span key={n} className={className} style={style} aria-label={format(dict.lockedLessonAria, { n, title })}>
            {cell}
          </span>
        ) : (
          <Link
            key={n}
            ref={isNext ? nextRef : undefined}
            href={`${basePath}/${n}`}
            className={className}
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
