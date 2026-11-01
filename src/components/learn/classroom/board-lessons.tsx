"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Lock, Play } from "lucide-react";
import { format } from "@/lib/format-dict";
import { useCourseUnlock } from "@/components/learn/use-course-unlock";
import { useProgress } from "@/store/progress";
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
  /** Written on the board once every lesson is learned. */
  allDone: string;
  dir: "rtl" | "ltr";
}

/** A lock that opened since the last visit springs off once the board has
    settled (seconds). */
const SPRING_DELAY = 1.1;

/**
 * A course's lessons up on the friend's board (2026-11-02 layout):
 *
 * - The lesson to play next, big in the middle — the one thing to look at:
 *   a paper sheet pinned up by one magnet, its thing, "Lesson 3", its word,
 *   one Start button. A lock that opened since the last visit springs off.
 * - Under it, EVERY lesson in order on one line, all the same size: the
 *   learned ones a chalk box with a tick, the next one ringed in the
 *   friend's chalk, the ones to come dashed and dim with a "?". A line that
 *   doesn't fit scrolls sideways, centred on the next one — never wraps.
 *
 * No stars (direct request 2026-11-02: no stars or rewards) — learned is
 * learned.
 */
export function BoardLessons({ titles, stops, characterId, lessonId, basePath, dict, allDone, dir }: BoardLessonsProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLAnchorElement>(null);
  const rowRef = useRef<HTMLOListElement>(null);
  const { stars, nextIndex, unlocking } = useCourseUnlock({
    characterId,
    lessonId,
    count: titles.length,
    rootRef,
    nextRef,
    scroll: true,
  });
  const hydrated = useProgress((state) => state.hydrated);

  /* The row may scroll: bring the lesson the child is on to its middle. */
  useEffect(() => {
    const row = rowRef.current;
    const now = row?.querySelector<HTMLElement>(".board-cell--now");
    if (row && now) row.scrollLeft = now.offsetLeft - (row.clientWidth - now.offsetWidth) / 2;
  }, [nextIndex]);

  let next: ReactNode = null;
  const cells = titles.map((title, i) => {
    const n = i + 1;
    const stop = stops[i];
    const done = stars[i] > 0;
    const now = i === nextIndex;
    const review = stop.review === true;
    /* A word still to learn keeps its name a secret; a review is labelled
       by its title. */
    const word = review || stop.word === undefined ? title : stop.word;
    const art = (locked: boolean, springing: boolean, sizes: string) => (
      <span className={`board-cell-art ${review ? "board-cell-art--row" : ""}`}>
        {stop.pictures.map((picture) => (
          <span key={picture.src} className="board-magnet">
            <Image
              src={locked && stop.blank ? stop.blank : picture}
              alt=""
              fill
              sizes={sizes}
              className={`object-contain ${springing ? "paint-reveal" : ""}`}
              style={springing ? { animationDelay: `${SPRING_DELAY + 0.1}s` } : undefined}
            />
          </span>
        ))}
      </span>
    );

    if (now) {
      const springing = i === unlocking;
      next = (
        <Link
          ref={nextRef}
          href={`${basePath}/${n}`}
          className="board-next"
          aria-label={format(dict.startLessonAria, { n, title })}
        >
          {art(false, springing, "(min-width: 1024px) 17rem, 10rem")}
          <span dir={dir} className="board-next-text">
            <span className="board-next-label">{format(dict.lessonN, { n })}</span>
            <span className="board-next-word">{word}</span>
            <span className="btn3d board-next-go" aria-hidden>
              <Play className="h-5 w-5 fill-current" strokeWidth={2.5} />
              <span>{dict.ctaStart}</span>
            </span>
          </span>
          {springing && (
            <span className="board-cell-lock path-lock-off" style={{ animationDelay: `${SPRING_DELAY}s` }} aria-hidden>
              <Lock className="h-5 w-5" strokeWidth={2.75} />
            </span>
          )}
        </Link>
      );
    }

    const open = done || now;
    const state = now ? "board-cell--now" : done ? "board-cell--done" : "board-cell--locked";
    /* A review's small box is its things, two by two — its long name
       ("Animals review") has no room under them; the label reads it out. */
    const inner = (
      <>
        <span className="board-cell-n" aria-hidden>
          {n}
        </span>
        {art(!open, false, "(min-width: 1024px) 5rem, 3rem")}
        {!review && (
          <span dir={dir} className="board-cell-word">
            {open ? word : "?"}
          </span>
        )}
        {done && (
          <span className="board-cell-tick" aria-hidden>
            <Check strokeWidth={3.5} />
          </span>
        )}
        {!open && (
          <span className="board-cell-lock" aria-hidden>
            <Lock className="h-3 w-3" strokeWidth={2.75} />
          </span>
        )}
      </>
    );
    const style = { animationDelay: `${0.35 + i * 0.04}s` };
    return (
      <li key={n} className="board-row-item">
        {open ? (
          <Link
            href={`${basePath}/${n}`}
            className={`board-cell ${state}`}
            style={style}
            aria-label={format(dict.startLessonAria, { n, title })}
            aria-current={now ? "step" : undefined}
          >
            {inner}
          </Link>
        ) : (
          <span className={`board-cell ${state}`} style={style} aria-label={format(dict.lockedLessonAria, { n, title })}>
            {inner}
          </span>
        )}
      </li>
    );
  });

  return (
    <div ref={rootRef} className={`board-lessons ${next ? "" : "board-lessons--all"}`}>
      {next}
      {!next && hydrated && (
        <p dir={dir} className="chalk-title board-all-done">
          {allDone}
        </p>
      )}
      <ol ref={rowRef} className="board-row">
        {cells}
      </ol>
    </div>
  );
}
