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
 * card an equal share of the height it is given — compact there, so three
 * courses fit one screen.
 */
export function CourseCardWide({ lesson, characterId, name, description, count, ariaLabel, dir, index }: CourseCardWideProps) {
  const { id, theme, totalItems, locked } = lesson;

  /* White clay like every course card (direct request 2026-10-02); the
     course's colour is in its play button and progress bar. */
  const style: ClayVars = { animationDelay: `${0.25 + index * 0.12}s` };
  const play: ClayVars = { backgroundColor: theme.accent, "--clay-edge": theme.accentDark };

  const body = (
    <>
      <CourseArt
        images={courseCovers(id)}
        width={420}
        className={`mx-auto my-auto aspect-square w-full shrink-0 lg:aspect-auto lg:h-full lg:w-[40%] ${locked ? "path-art-locked" : ""}`}
      />
      <div className="flex flex-col gap-4 lg:min-w-0 lg:flex-1 lg:justify-center lg:gap-3">
        <div dir={dir} className="min-w-0">
          {/* A short desktop screen drops the count and the description, so
              three courses still fit without a scroll. */}
          <p className="text-sm font-bold uppercase tracking-wide lg:[@media(max-height:820px)]:hidden" style={{ color: locked ? "var(--color-ink-soft)" : theme.accentDark }}>
            {count}
          </p>
          <h2 className="mt-1 text-3xl font-bold leading-tight text-[var(--color-ink)] xl:text-4xl">
            {name}
          </h2>
          <p className="mt-1.5 text-base text-[var(--color-ink-soft)] lg:truncate xl:text-lg lg:[@media(max-height:820px)]:hidden">
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
              <CourseProgress characterId={characterId} lessonId={id} total={totalItems} fill={{ face: theme.accent, edge: theme.accentDark }} className="flex-1" />
              <span className="clay flex h-16 w-16 shrink-0 items-center justify-center rounded-full lg:h-14 lg:w-14" style={play} aria-hidden>
                <Play className="ml-1 h-7 w-7 fill-white text-white" strokeWidth={0} />
              </span>
            </>
          )}
        </div>
      </div>
    </>
  );

  const cardClass = `card card-clay-white anim-fade-up flex h-full flex-col gap-4 p-6 lg:min-h-0 lg:flex-row lg:gap-6 lg:px-6 lg:py-4 ${
    locked ? "" : "card-lift"
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
