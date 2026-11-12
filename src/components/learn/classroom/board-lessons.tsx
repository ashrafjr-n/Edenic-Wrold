"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
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
 * - Under it, EVERY lesson in order, in rows of equal chalk cards (2026-11-05;
 *   the board grows tall): the learned ones with a tick, the next one ringed
 *   in the friend's chalk, the ones to come dashed and dim with a "?".
 *
 * No stars (direct request 2026-11-02: no stars or rewards) — learned is
 * learned.
 */
export function BoardLessons({ titles, stops, characterId, lessonId, basePath, dict, allDone, dir }: BoardLessonsProps) {
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
  const hydrated = useProgress((state) => state.hydrated);

  /** Lesson `i`'s word and its thing(s) as magnets. */
  const lessonAt = (i: number) => {
    const title = titles[i];
    const stop = stops[i];
    const word = stop.word ?? title;
    const art = (locked: boolean, springing: boolean, sizes: string) => (
      <span className="board-cell-art">
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
    return { n: i + 1, title, word, art };
  };

  let next: ReactNode = null;
  if (nextIndex >= 0) {
    const { n, title, word, art } = lessonAt(nextIndex);
    const springing = nextIndex === unlocking;
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
            <span>{nextIndex === 0 ? dict.ctaStart : dict.ctaContinue}</span>
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

  const cells = titles.map((_, i) => {
    const { n, title, word, art } = lessonAt(i);
    const done = stars[i] > 0;
    const now = i === nextIndex;
    const open = done || now;
    const state = now ? "board-cell--now" : done ? "board-cell--done" : "board-cell--locked";
    const inner = (
      <>
        <span className="board-cell-n" aria-hidden>
          {n}
        </span>
        {art(!open, false, "(min-width: 1024px) 5rem, 3rem")}
        <span dir={dir} className="board-cell-word">
          {/* A word still to learn keeps its name a secret. */}
          {open ? word : "?"}
        </span>
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
      <li key={n}>
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

  /* Never one card alone on the last row: a column more where it would be. */
  const lessons = stops.length;
  const columns = {
    "--cols-phone": lessons % 3 === 1 ? 4 : 3,
    "--cols-tablet": lessons % 4 === 1 ? 5 : 4,
  } as CSSProperties;

  return (
    <div ref={rootRef} className={`board-lessons ${next ? "" : "board-lessons--all"}`}>
      {next}
      {!next && hydrated && (
        <p dir={dir} className="chalk-title board-all-done">
          {allDone}
        </p>
      )}
      <ol className="board-row" style={columns}>
        {cells}
      </ol>
    </div>
  );
}
