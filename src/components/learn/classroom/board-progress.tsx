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
 * the store has read localStorage. A phone's board head is narrow (the
 * course's thing and Continue share it), so there it is the hub card's
 * "2/5" beside the bar; the sentence stays for a screen reader.
 */
export function BoardProgress({ characterId, lessonId, total, template, dir }: BoardProgressProps) {
  const stars = useCourseStars(characterId, lessonId, total);
  const done = stars.filter((s) => s > 0).length;
  return (
    <div className="board-progress">
      <p dir={dir} className="chalk-sub max-sm:sr-only">
        {format(template, { done, total })}
      </p>
      <div className="board-progress-row" aria-hidden>
        <span className="chalk-progress-track">
          <span className="chalk-progress-fill" style={{ width: `${(done / total) * 100}%` }} />
        </span>
        <span dir="ltr" className="board-progress-count sm:hidden">
          {done}/{total}
        </span>
      </div>
    </div>
  );
}
