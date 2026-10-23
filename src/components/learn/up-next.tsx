"use client";

import { itemKey, useProgress } from "@/store/progress";

export interface UpNextCourse {
  id: string;
  name: string;
  /** Lesson titles, 1…n. */
  titles: readonly string[];
}

/** The one lesson to play next across a character's courses (the first
    not done, in course order), and whether its course is started — null
    once every lesson is done. Nothing is done until the store has read
    localStorage, so the first render matches the server's. The classroom
    lights that course's sheet. */
export function useUpNext<C extends Pick<UpNextCourse, "id" | "titles">>(characterId: string, courses: readonly C[]) {
  const items = useProgress((state) => state.items);
  const hydrated = useProgress((state) => state.hydrated);
  const done = (courseId: string, n: number) =>
    hydrated && (items[itemKey(characterId, courseId, n)]?.stars ?? 0) > 0;

  const next = courses
    .map((course) => ({ course, index: course.titles.findIndex((_, i) => !done(course.id, i + 1)) }))
    .find(({ index }) => index !== -1);
  if (!next) return null;
  return { ...next, started: next.course.titles.some((_, i) => done(next.course.id, i + 1)) };
}
