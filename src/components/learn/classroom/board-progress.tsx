"use client";

import { format } from "@/lib/format-dict";
import { useCourseStars } from "@/store/progress";

interface BoardProgressProps {
  characterId: string;
  lessonId: string;
  total: number;
  /** "{done} of {total} learned". */
  template: string;
  dir: "rtl" | "ltr";
}

/**
 * How far along a course is, on its board (2026-10-14): "2 of 5 learned"
 * over a slim bar — what a child and a parent want to know, where the
 * board used to say only how many lessons there are. Nothing learned until
 * the store has read localStorage.
 */
export function BoardProgress({ characterId, lessonId, total, template, dir }: BoardProgressProps) {
  const stars = useCourseStars(characterId, lessonId, total);
  const done = stars.filter((s) => s > 0).length;
  return (
    <div className="board-progress">
      <p dir={dir} className="chalk-sub">
        {format(template, { done, total })}
      </p>
      <span className="chalk-progress-track" aria-hidden>
        <span className="chalk-progress-fill" style={{ width: `${(done / total) * 100}%` }} />
      </span>
    </div>
  );
}
