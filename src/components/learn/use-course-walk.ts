"use client";

import { useEffect, useState, type RefObject } from "react";
import { useRouter } from "next/navigation";
import { useCourseStars, useProgress } from "@/store/progress";

/* The walk from a finished lesson to the next one, in ms from arrival: the
   finished one takes its tick (and the track draws on), then the next one's
   padlock springs off, then its lesson opens. */
const WALK_AT = 1300;
const OPEN_AT = 2400;
const GO_AT = 3800;

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

interface CourseWalkOptions {
  characterId: string;
  lessonId: string;
  /** `/learn/pinki/shapes` — the next lesson is `${basePath}/${n}`. */
  basePath: string;
  count: number;
  /** Arriving from the done screen of this lesson (1-based, `?from=`). */
  advanceFrom?: number;
  /** The view's root: a page renders one per screen size and hides the
      others, and only the one on screen may walk, remember or scroll. */
  rootRef: RefObject<HTMLElement | null>;
  /** The next lesson's element, scrolled into view when `scroll`. */
  nextRef: RefObject<HTMLElement | null>;
  scroll: boolean;
}

/**
 * Where a child is in a course, and the little show when they come back
 * from a finished lesson — shared by every view of a course's lessons (the
 * winding path, the Colors box).
 *
 * `current` is the lesson wearing the "next" look: the finished one while the
 * child arrives (`walked === "at"`), none while the walk runs, the new one
 * once it opens. `unlocking` is the lesson whose padlock springs off.
 */
export function useCourseWalk({ characterId, lessonId, basePath, count, advanceFrom, rootRef, nextRef, scroll }: CourseWalkOptions) {
  const router = useRouter();
  const stars = useCourseStars(characterId, lessonId, count);
  const hydrated = useProgress((state) => state.hydrated);
  const nextIndex = stars.findIndex((s) => s === 0);
  const allDone = nextIndex === -1;

  /* Latched once, and only if the child has not yet SEEN the lesson after
     `from` open: a Back from the next lesson remounts the page with the same
     cached `?from=`, and must land on a still page, not walk them on again. */
  const [walkFrom] = useState(() => {
    if (advanceFrom === undefined || typeof window === "undefined") return advanceFrom;
    const seen = readSeen()[`${characterId}.${lessonId}`];
    return seen === undefined || seen < advanceFrom ? advanceFrom : undefined;
  });
  const [phase, setPhase] = useState<"at" | "walk" | "open">("at");
  /* Only when progress agrees: the lesson just finished is the one right
     before the next open one. */
  const advancing = hydrated && walkFrom !== undefined && walkFrom === nextIndex;
  const walked = advancing ? phase : "open";
  const from = nextIndex - 1;
  const current = walked === "at" ? from : walked === "walk" ? -1 : nextIndex;
  const [unlocking, setUnlocking] = useState(-1);

  useEffect(() => {
    if (!advancing || rootRef.current?.offsetParent == null) return;
    window.history.replaceState(null, "", basePath);
    const timers = [
      setTimeout(() => setPhase("walk"), WALK_AT),
      setTimeout(() => {
        setPhase("open");
        setUnlocking(nextIndex);
      }, OPEN_AT),
      setTimeout(() => router.push(`${basePath}/${nextIndex + 1}`), GO_AT),
    ];
    return () => timers.forEach(clearTimeout);
  }, [advancing, basePath, nextIndex, router, rootRef]);

  /* Once progress is known: bring the next lesson into view, and spring its
     lock if it opened since the last visit (the walk springs its own). */
  useEffect(() => {
    if (!hydrated || allDone || rootRef.current?.offsetParent == null) return;
    const seen = readSeen();
    const key = `${characterId}.${lessonId}`;
    const timer = setTimeout(() => {
      if (!advancing && seen[key] !== undefined && seen[key] < nextIndex) setUnlocking(nextIndex);
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
  }, [hydrated, allDone, advancing, nextIndex, characterId, lessonId, scroll, rootRef, nextRef]);

  return { stars, nextIndex, allDone, advancing, walked, from, current, unlocking };
}
