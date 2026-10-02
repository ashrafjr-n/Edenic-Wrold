"use client";

import { useEffect, useState, type RefObject } from "react";
import { useCourseStars, useProgress } from "@/store/progress";

/* Remembers, per course, the furthest lesson the child has SEEN open — so a
   lesson opened since the last visit can spring its lock off once. */
const SEEN_KEY = "edenic-path-seen";

function readSeen(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) ?? "{}");
  } catch {
    return {};
  }
}

interface CourseUnlockOptions {
  characterId: string;
  lessonId: string;
  count: number;
  /** The view's root: a page renders one per screen size and hides the
      others, and only the one on screen may remember or scroll. */
  rootRef: RefObject<HTMLElement | null>;
  /** The next lesson's element, scrolled into view when `scroll`. */
  nextRef: RefObject<HTMLElement | null>;
  scroll: boolean;
}

/**
 * Where a child is in a course: each lesson's stars, the next one to play,
 * and — on the first visit since it opened — the lesson whose padlock
 * springs off. A finished lesson's Next goes straight on to the next lesson
 * (direct request 2026-10-02), so the course page only ever sees a child
 * coming BACK; the lock is how it shows what opened while they were away.
 */
export function useCourseUnlock({ characterId, lessonId, count, rootRef, nextRef, scroll }: CourseUnlockOptions) {
  const stars = useCourseStars(characterId, lessonId, count);
  const hydrated = useProgress((state) => state.hydrated);
  const nextIndex = stars.findIndex((s) => s === 0);
  const allDone = nextIndex === -1;
  const [unlocking, setUnlocking] = useState(-1);

  /* Once progress is known: bring the next lesson into view, and spring its
     lock if it opened since the last visit. */
  useEffect(() => {
    if (!hydrated || allDone || rootRef.current?.offsetParent == null) return;
    const seen = readSeen();
    const key = `${characterId}.${lessonId}`;
    const timer = setTimeout(() => {
      if (seen[key] !== undefined && seen[key] < nextIndex) setUnlocking(nextIndex);
      try {
        localStorage.setItem(SEEN_KEY, JSON.stringify({ ...seen, [key]: nextIndex }));
      } catch {
        /* Storage off: the lock just doesn't spring. Nothing is lost. */
      }
      const el = nextRef.current;
      if (scroll && el && el.getBoundingClientRect().bottom > window.innerHeight - 160) {
        el.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [hydrated, allDone, nextIndex, characterId, lessonId, scroll, rootRef, nextRef]);

  return { stars, nextIndex, unlocking };
}
