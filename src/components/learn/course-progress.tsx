"use client";

import type { CSSProperties } from "react";
import { useCourseStars } from "@/store/progress";

interface CourseProgressProps {
  characterId: string;
  lessonId: string;
  total: number;
  /** On a WHITE card: the bar fills in the course's own colour and the
      count reads in ink. Without it, the bar is white clay sunk into a
      coloured card (the course page's banner), the count in the banner's
      own text colour. */
  fill?: { face: string; edge: string };
  className?: string;
}

/** How far into a course the child is: a clay bar and "2 / 5" beside it. */
export function CourseProgress({ characterId, lessonId, total, fill, className = "" }: CourseProgressProps) {
  const done = useCourseStars(characterId, lessonId, total).filter((stars) => stars > 0).length;

  return (
    /* `ltr` whatever the locale: the layout never mirrors, and "0 / 5"
       would read "5 / 0" inside a right-to-left column. */
    <div
      dir="ltr"
      className={`flex items-center gap-3 ${className}`}
      style={fill ? ({ "--clay-edge": "var(--color-locked-dark)" } as CSSProperties) : undefined}
    >
      <div className="course-track h-3.5 flex-1">
        <div
          className="course-track-fill h-full"
          style={{
            width: `${total > 0 ? (done / total) * 100 : 0}%`,
            ...(fill ? { backgroundColor: fill.face, boxShadow: `inset 0 -3px 4px -1px ${fill.edge}` } : {}),
          }}
        />
      </div>
      <span className={`shrink-0 text-sm font-bold tabular-nums ${fill ? "text-[var(--color-ink-soft)]" : "text-current"}`}>
        {done} / {total}
      </span>
    </div>
  );
}
