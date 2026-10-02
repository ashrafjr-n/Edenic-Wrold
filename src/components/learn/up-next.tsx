"use client";

import type { CSSProperties } from "react";
import Image, { type StaticImageData } from "next/image";
import { ArrowRight } from "lucide-react";
import { Button3D } from "@/components/ui/button-3d";
import { itemKey, useProgress } from "@/store/progress";

export interface UpNextCourse {
  id: string;
  name: string;
  /** Lesson titles, 1…n. */
  titles: readonly string[];
  /** Each lesson's cover (`LessonDef.cover`). */
  covers: readonly (readonly StaticImageData[])[];
  tone: { face: string; edge: string; ink: string };
}

interface UpNextProps {
  characterId: string;
  /** The character's open courses, in order. */
  courses: readonly UpNextCourse[];
  labels: { upNext: string; start: string; continue: string };
  dir: "rtl" | "ltr";
  className?: string;
}

/**
 * The one lesson to play next, across all of a character's courses: its
 * thing on a clay disc in the course colour, the course and lesson names,
 * and a button straight into it (tablet and desktop hub). Renders nothing
 * once every lesson is done.
 */
export function UpNext({ characterId, courses, labels, dir, className = "" }: UpNextProps) {
  const items = useProgress((state) => state.items);
  const hydrated = useProgress((state) => state.hydrated);
  const done = (courseId: string, n: number) =>
    hydrated && (items[itemKey(characterId, courseId, n)]?.stars ?? 0) > 0;

  const next = courses
    .map((course) => ({ course, index: course.titles.findIndex((_, i) => !done(course.id, i + 1)) }))
    .find(({ index }) => index !== -1);
  if (!next) return null;

  const { course, index } = next;
  const cover = course.covers[index]?.[0];
  const started = course.titles.some((_, i) => done(course.id, i + 1));

  return (
    <div className={`card card-clay-white flex items-center gap-4 p-4 pe-5 ${className}`}>
      <span
        className="clay relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: course.tone.face, "--clay-edge": course.tone.edge, "--art-shadow": course.tone.edge } as CSSProperties}
      >
        {cover && <Image src={cover} alt="" sizes="52px" className="course-art-thing h-auto w-[64%]" />}
      </span>
      <div dir={dir} className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold uppercase tracking-wide" style={{ color: course.tone.edge }}>
          {labels.upNext} · {course.name}
        </p>
        <p className="truncate text-2xl font-bold text-[var(--color-ink)]">{course.titles[index]}</p>
      </div>
      <Button3D
        href={`/learn/${characterId}/${course.id}/${index + 1}`}
        tone={{ ...course.tone, text: course.tone.ink }}
        className="shrink-0 gap-2 px-6 py-3 text-base"
      >
        {started ? labels.continue : labels.start}
        <ArrowRight className="h-5 w-5" strokeWidth={2.75} />
      </Button3D>
    </div>
  );
}
