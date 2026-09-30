import type { CSSProperties } from "react";
import Image, { type StaticImageData } from "next/image";

interface LessonAboutProps {
  /** "Learn Shapes". */
  courseName: string;
  /** "Circle". */
  title: string;
  /** Every lesson's cover in the course, in order. */
  covers: readonly (readonly StaticImageData[])[];
  /** 0-based: which of them this lesson is. */
  index: number;
  tone: { face: string; edge: string };
  dir: "rtl" | "ltr";
  className?: string;
}

/**
 * What this lesson is (tablet, beside the step; a desktop shows it as the
 * back row's `LessonChip` instead): its thing on a
 * big clay disc in the course colour, its name, and where it sits in the
 * course — a row of the course's lessons with this one standing out.
 */
export function LessonAbout({ courseName, title, covers, index, tone, dir, className = "" }: LessonAboutProps) {
  const cover = covers[index]?.[0];
  return (
    <div className={`card card-clay-white flex items-center gap-4 p-4 ${className}`}>
      <span
        className="clay flex h-24 w-24 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: tone.face, "--clay-edge": tone.edge, "--art-shadow": tone.edge } as CSSProperties}
      >
        {cover && <Image src={cover} alt="" sizes="96px" className="course-art-thing h-auto w-[64%]" />}
      </span>
      <div dir={dir} className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold uppercase tracking-wide" style={{ color: tone.edge }}>
          {courseName}
        </p>
        <p className="truncate text-2xl font-bold text-[var(--color-ink)]">{title}</p>
        <div dir="ltr" className="mt-2 flex gap-1.5" aria-hidden>
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
    </div>
  );
}
