"use client";

import { useCourseStars } from "@/store/progress";

interface CourseProgressProps {
  characterId: string;
  lessonId: string;
  total: number;
  className?: string;
}

/** How far into a course the child is: a white clay bar sunk into a
    coloured card, and "2 / 5" beside it. */
export function CourseProgress({ characterId, lessonId, total, className = "" }: CourseProgressProps) {
  const done = useCourseStars(characterId, lessonId, total).filter((stars) => stars > 0).length;

  return (
    /* `ltr` whatever the locale: the layout never mirrors, and "0 / 5"
       would read "5 / 0" inside a right-to-left column. */
    <div dir="ltr" className={`flex items-center gap-3 ${className}`}>
      <div className="course-track h-3.5 flex-1">
        <div
          className="course-track-fill h-full"
          style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }}
        />
      </div>
      <span className="shrink-0 text-sm font-bold tabular-nums text-white">
        {done} / {total}
      </span>
    </div>
  );
}
