"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Lock, Play, Star } from "lucide-react";
import { format } from "@/lib/format-dict";
import { useCourseUnlock } from "@/components/learn/use-course-unlock";
import { itemKey, useProgress } from "@/store/progress";
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

/* The stars each lesson had the last time the child saw its board — stars
   earned since fly into their lesson's box, once. */
const STARS_SEEN_KEY = "edenic-board-stars-seen";

function readStarsSeen(): Record<string, number> {
  try {
    const seen: unknown = JSON.parse(localStorage.getItem(STARS_SEEN_KEY) ?? "{}");
    return seen && typeof seen === "object" ? (seen as Record<string, number>) : {};
  } catch {
    return {};
  }
}

/**
 * A course's lessons up on Pinki's board (2026-10-23 layout): the lesson to
 * play next big in the middle — a paper sheet pinned up by two magnets,
 * "Lesson 3", its thing and word, one Start button — the lessons learned
 * small side by side on ONE line above it (it scrolls sideways when it
 * doesn't fit) (each with the stars it earned, of 3, any
 * earned since the last visit flying in), the ones still to come small
 * on one line below it, dimmed, a "?" for their word (a colour shows an empty pot). A
 * lock that opened since the last visit springs off the big sheet.
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
  /* What the board showed last time, read once progress is known: until
     then a learned lesson's stars wait hidden, so a new one never shows,
     vanishes and flies in. */
  const [seen, setSeen] = useState<Record<string, number> | null>(null);
  const starsKey = stars.join(",");
  useEffect(() => {
    if (!hydrated) return;
    const timer = setTimeout(() => {
      const before = readStarsSeen();
      setSeen((current) => current ?? before);
      const now = { ...before };
      starsKey.split(",").forEach((s, i) => {
        if (Number(s) > 0) now[itemKey(characterId, lessonId, i + 1)] = Number(s);
      });
      try {
        localStorage.setItem(STARS_SEEN_KEY, JSON.stringify(now));
      } catch {
        /* Storage off: the stars just don't fly. Nothing is lost. */
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [hydrated, starsKey, characterId, lessonId]);

  /* The learned row is one line that may scroll: start it at its end, the
     latest lesson learned beside the next one. */
  const learnedRef = useRef<HTMLDivElement>(null);
  const learnedCount = stars.filter((s) => s > 0).length;
  useEffect(() => {
    const row = learnedRef.current;
    if (row) row.scrollLeft = row.scrollWidth;
  }, [learnedCount]);

  let flying = 0;
  const learned: ReactNode[] = [];
  const later: ReactNode[] = [];
  let next: ReactNode = null;

  titles.forEach((title, i) => {
    const n = i + 1;
    const stop = stops[i];
    const done = stars[i] > 0;
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
    const style = { animationDelay: `${0.35 + i * 0.05}s` };

    if (i === nextIndex) {
      const springing = i === unlocking;
      next = (
        <Link
          key={n}
          ref={nextRef}
          href={`${basePath}/${n}`}
          className="board-next"
          aria-label={format(dict.startLessonAria, { n, title })}
        >
          {art(false, springing, "(min-width: 1024px) 15rem, 8rem")}
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
    } else if (done) {
      learned.push(
        <Link
          key={n}
          href={`${basePath}/${n}`}
          className="board-cell"
          style={style}
          aria-label={format(dict.startLessonAria, { n, title })}
        >
          {art(false, false, "(min-width: 1024px) 5rem, 3rem")}
          <span dir={dir} className="board-cell-word">{word}</span>
          <span className="board-cell-stars" aria-hidden>
            {[1, 2, 3].map((k) => {
              const earned = k <= stars[i];
              const isNew = earned && seen !== null && k > (seen[itemKey(characterId, lessonId, n)] ?? 0);
              const state = !earned ? "" : seen === null ? "board-star--on board-star--waiting" : isNew ? "board-star--on board-star--new" : "board-star--on";
              return (
                <Star
                  key={k}
                  className={`board-star ${state}`}
                  style={isNew ? { animationDelay: `${0.6 + flying++ * 0.18}s` } : undefined}
                  strokeWidth={2.5}
                />
              );
            })}
          </span>
        </Link>,
      );
    } else {
      later.push(
        <span
          key={n}
          className="board-cell board-cell--locked"
          style={style}
          aria-label={format(dict.lockedLessonAria, { n, title })}
        >
          {art(true, false, "(min-width: 1024px) 5rem, 3rem")}
          <span dir={dir} className="board-cell-word">{review ? title : "?"}</span>
          <span className="board-cell-lock" aria-hidden>
            <Lock className="h-3 w-3" strokeWidth={2.75} />
          </span>
        </span>,
      );
    }
  });

  return (
    <div ref={rootRef} className={`board-lessons ${next ? "" : "board-lessons--all"}`}>
      {learned.length > 0 && (
        <div ref={learnedRef} className="board-row">
          {learned}
        </div>
      )}
      {next}
      {!next && hydrated && (
        <p dir={dir} className="chalk-title board-all-done">
          {allDone}
        </p>
      )}
      {later.length > 0 && <div className="board-row">{later}</div>}
    </div>
  );
}
