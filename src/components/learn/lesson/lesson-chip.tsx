import type { CSSProperties } from "react";
import Image, { type StaticImageData } from "next/image";

interface LessonChipProps {
  /** "Learn Shapes". */
  courseName: string;
  /** "Circle". */
  title: string;
  /** The lesson's thing, on a small clay disc. */
  cover?: StaticImageData;
  tone: { face: string; edge: string };
  dir: "rtl" | "ltr";
  className?: string;
}

/**
 * Which lesson this is, as a white pill at the end of the desktop's back
 * row: the lesson's thing on a clay disc in the course colour, the course
 * above the lesson's name.
 */
export function LessonChip({ courseName, title, cover, tone, dir, className = "" }: LessonChipProps) {
  return (
    <div dir={dir} className={`card card-pill items-center gap-3 py-1.5 pe-5 ps-1.5 ${className}`}>
      <span
        className="clay flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: tone.face, "--clay-edge": tone.edge } as CSSProperties}
      >
        {cover && <Image src={cover} alt="" sizes="28px" className="h-auto w-[64%]" />}
      </span>
      <span className="min-w-0 leading-tight">
        <span className="block truncate text-xs font-bold uppercase tracking-wide" style={{ color: tone.edge }}>
          {courseName}
        </span>
        <span className="block truncate text-lg font-bold text-[var(--color-ink)]">{title}</span>
      </span>
    </div>
  );
}
