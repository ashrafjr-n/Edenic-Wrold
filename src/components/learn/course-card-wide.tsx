import type { CSSProperties } from "react";
import Link from "next/link";
import { Lock, Play } from "lucide-react";
import { courseCovers } from "@/data/courses";
import { CourseArt } from "@/components/learn/course-art";
import { CourseProgress } from "@/components/learn/course-progress";
import type { Lesson } from "@/types/lesson";

interface CourseCardWideProps {
  lesson: Lesson;
  characterId: string;
  name: string;
  description: string;
  /** "5 lessons". */
  count: string;
  /** "Start Learn Shapes" — the card's only announced text. */
  ariaLabel: string;
  dir: "rtl" | "ltr";
  index: number;
}

type ClayVars = CSSProperties & Record<`--${string}`, string>;

/**
 * One course on a character's hub, tablet and desktop — the phone's
 * `CourseCard` grown to fill a big screen. Upright on a tablet (two side by
 * side: the pile of things on top, words under it); lying down on a desktop
 * (one above the other, the pile on the left, words on the right), each
 * card taking half the height it is given.
 */
export function CourseCardWide({ lesson, characterId, name, description, count, ariaLabel, dir, index }: CourseCardWideProps) {
  const { id, theme, totalItems, locked } = lesson;

  const style: ClayVars = {
    animationDelay: `${0.25 + index * 0.12}s`,
    ...(locked ? {} : { backgroundColor: theme.accent, "--clay-edge": theme.accentDark }),
  };

  const body = (
    <>
      <CourseArt
        images={courseCovers(id)}
        width={420}
        className={`mx-auto my-auto aspect-square w-full shrink-0 lg:aspect-[4/3] lg:w-[46%] ${locked ? "path-art-locked" : ""}`}
      />
      <div className="flex flex-col gap-4 lg:flex-1 lg:justify-center lg:gap-5">
        <div dir={dir} className="min-w-0">
          <p className={`text-sm font-bold uppercase tracking-wide ${locked ? "text-[var(--color-ink-soft)]" : "text-white/85"}`}>
            {count}
          </p>
          <h2
            className={`mt-1 text-3xl font-bold leading-tight xl:text-5xl ${
              locked ? "text-[var(--color-ink)]" : "clay-title text-white"
            }`}
          >
            {name}
          </h2>
          <p className={`mt-1.5 text-base xl:text-lg ${locked ? "text-[var(--color-ink-soft)]" : "text-white/90"}`}>
            {description}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {locked ? (
            <span className="lock-chip h-16 w-16 shrink-0" aria-hidden>
              <Lock className="h-6 w-6" strokeWidth={2.75} />
            </span>
          ) : (
            <>
              <CourseProgress characterId={characterId} lessonId={id} total={totalItems} className="flex-1" />
              <span className="btn3d btn3d--clay-white h-16 w-16 shrink-0 xl:h-[4.5rem] xl:w-[4.5rem]" aria-hidden>
                <Play className="ml-1 h-7 w-7" style={{ color: theme.accent, fill: theme.accent }} strokeWidth={0} />
              </span>
            </>
          )}
        </div>
      </div>
    </>
  );

  const cardClass = `card anim-fade-up flex h-full flex-col gap-4 p-6 lg:flex-row lg:gap-6 xl:p-8 ${
    locked ? "card-clay-white" : "clay card-lift"
  }`;

  return locked ? (
    <div className={cardClass} style={style} aria-disabled="true">
      {body}
    </div>
  ) : (
    <Link href={`/learn/${characterId}/${id}`} className={cardClass} style={style} aria-label={ariaLabel}>
      {body}
    </Link>
  );
}
