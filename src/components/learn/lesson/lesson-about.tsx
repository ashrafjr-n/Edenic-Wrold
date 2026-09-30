"use client";

import type { CSSProperties } from "react";
import Image, { type StaticImageData } from "next/image";
import { Check, Lock } from "lucide-react";
import { useCourseStars } from "@/store/progress";

interface LessonAboutProps {
  /** "Learn Shapes". */
  courseName: string;
  /** "Circle". */
  title: string;
  /** Every lesson's title in the course, in order — the desktop list. */
  titles?: readonly string[];
  /** Every lesson's cover in the course, in order. */
  covers: readonly (readonly StaticImageData[])[];
  /** 0-based: which of them this lesson is. */
  index: number;
  characterId: string;
  courseId: string;
  tone: { face: string; edge: string };
  dir: "rtl" | "ltr";
  className?: string;
}

/**
 * What this lesson is (tablet and desktop, beside the step): its thing on a
 * big clay disc in the course colour, its name, and where it sits in the
 * course. Tablet: a row of the course's lessons with this one standing out.
 * Desktop: the course's lessons as a list — done ones ticked, this one in
 * the course colour, the ones still closed with a padlock.
 */
export function LessonAbout({
  courseName,
  title,
  titles,
  covers,
  index,
  characterId,
  courseId,
  tone,
  dir,
  className = "",
}: LessonAboutProps) {
  const cover = covers[index]?.[0];
  const stars = useCourseStars(characterId, courseId, covers.length);
  return (
    <div className={`card card-clay-white flex items-center gap-4 p-4 lg:flex-col lg:gap-4 lg:p-6 ${className}`}>
      <span
        className="clay flex h-24 w-24 shrink-0 items-center justify-center rounded-full lg:h-[min(9rem,14svh)] lg:w-[min(9rem,14svh)]"
        style={{ backgroundColor: tone.face, "--clay-edge": tone.edge, "--art-shadow": tone.edge } as CSSProperties}
      >
        {cover && <Image src={cover} alt="" sizes="96px" className="course-art-thing h-auto w-[64%]" />}
      </span>
      <div dir={dir} className="min-w-0 flex-1 lg:flex-none lg:text-center">
        <p className="truncate text-xs font-bold uppercase tracking-wide" style={{ color: tone.edge }}>
          {courseName}
        </p>
        <p className="truncate text-2xl font-bold text-[var(--color-ink)] xl:text-3xl">{title}</p>
        <div dir="ltr" className={`mt-2 flex gap-1.5 lg:justify-center ${titles ? "lg:hidden" : ""}`} aria-hidden>
          {covers.map((c, i) => (
            <span
              key={i}
              className={`relative flex h-7 w-7 items-center justify-center rounded-full ${i === index ? "clay" : "bg-[var(--background)]"}`}
              style={i === index ? ({ backgroundColor: tone.face, "--clay-edge": tone.edge } as CSSProperties) : undefined}
            >
              {c[0] && (
                <Image src={c[0]} alt="" sizes="20px" className={`h-auto w-[68%] ${i === index ? "" : "opacity-60"}`} />
              )}
            </span>
          ))}
        </div>
      </div>

      {titles && (
        <ol dir={dir} className="hidden w-full flex-col gap-1.5 border-t-2 border-[var(--background)] pt-4 lg:flex">
          {titles.map((name, i) => {
            const done = stars[i] > 0;
            const current = i === index;
            const open = i === 0 || stars[i - 1] > 0;
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
                    <Image
                      src={covers[i][0]}
                      alt=""
                      sizes="24px"
                      className={`h-auto w-[66%] ${open || current ? "" : "opacity-50"}`}
                    />
                  )}
                </span>
                <span className={`min-w-0 flex-1 text-base font-bold leading-tight ${open || current ? "" : "opacity-55"}`}>
                  {name}
                </span>
                {done && !current ? (
                  <span
                    className="clay flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white"
                    style={{ backgroundColor: "var(--color-go)", "--clay-edge": "var(--color-go-dark)" } as CSSProperties}
                  >
                    <Check className="h-3.5 w-3.5" strokeWidth={3.5} />
                  </span>
                ) : !open && !current ? (
                  <Lock className="h-4 w-4 shrink-0 text-[var(--color-locked-text)]" strokeWidth={2.75} />
                ) : null}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
