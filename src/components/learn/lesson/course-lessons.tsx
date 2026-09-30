"use client";

import type { CSSProperties } from "react";
import Image, { type StaticImageData } from "next/image";
import { Check, Lock } from "lucide-react";
import { useCourseStars } from "@/store/progress";

type LessonState = "done" | "current" | "open" | "locked";

/** Where each lesson stands: this one, finished ones, the ones open to play
    (the first, or any after a finished one), and the rest still closed. */
function lessonStates(stars: readonly number[], index: number): LessonState[] {
  return stars.map((count, i) => {
    if (i === index) return "current";
    if (count > 0) return "done";
    return i === 0 || stars[i - 1] > 0 ? "open" : "locked";
  });
}

const GO = { backgroundColor: "var(--color-go)", "--clay-edge": "var(--color-go-dark)" } as CSSProperties;

interface CourseLessonsProps {
  /** Every lesson's title in the course, in order. */
  titles: readonly string[];
  /** Every lesson's cover, in the same order. */
  covers: readonly (readonly StaticImageData[])[];
  /** 0-based: the lesson being played. */
  index: number;
  characterId: string;
  courseId: string;
  /** The course's name — the list's name for a screen reader. */
  label: string;
  tone: { face: string; edge: string };
  dir: "rtl" | "ltr";
  className?: string;
}

/**
 * The course's lessons as a list (desktop, in the lesson panel): each one's
 * cover and title — finished ones ticked, this one a pill in the course
 * colour, the ones still closed faded with a padlock.
 */
export function CourseLessons({
  titles,
  covers,
  index,
  characterId,
  courseId,
  label,
  tone,
  dir,
  className = "",
}: CourseLessonsProps) {
  const states = lessonStates(useCourseStars(characterId, courseId, titles.length), index);
  return (
    <ol dir={dir} aria-label={label} className={`flex w-full flex-col gap-1.5 ${className}`}>
      {titles.map((name, i) => {
        const state = states[i];
        const current = state === "current";
        const faded = state === "locked";
        return (
          <li
            key={name}
            aria-current={current ? "step" : undefined}
            className={`flex items-center gap-3 rounded-full py-1.5 pe-3 ps-1.5 ${current ? "clay text-white" : "text-[var(--color-ink)]"}`}
            style={current ? ({ backgroundColor: tone.face, "--clay-edge": tone.edge } as CSSProperties) : undefined}
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                current ? "bg-white" : "bg-[var(--background)]"
              }`}
            >
              {covers[i]?.[0] && (
                <Image src={covers[i][0]} alt="" sizes="24px" className={`h-auto w-[66%] ${faded ? "opacity-50" : ""}`} />
              )}
            </span>
            <span className={`min-w-0 flex-1 text-base font-bold leading-tight ${faded ? "opacity-55" : ""}`}>{name}</span>
            {state === "done" && (
              <span className="clay flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white" style={GO}>
                <Check className="h-3.5 w-3.5" strokeWidth={3.5} />
              </span>
            )}
            {state === "locked" && (
              <Lock className="h-4 w-4 shrink-0 text-[var(--color-locked-text)]" strokeWidth={2.75} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
