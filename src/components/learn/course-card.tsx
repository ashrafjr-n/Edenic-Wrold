import type { CSSProperties } from "react";
import Link from "next/link";
import { Lock, Play } from "lucide-react";
import { courseCovers } from "@/data/courses";
import { CourseArt } from "@/components/learn/course-art";
import { CourseProgress } from "@/components/learn/course-progress";
import type { Lesson } from "@/types/lesson";

interface CourseCardProps {
  lesson: Lesson;
  characterId: string;
  name: string;
  description: string;
  /** "Start Learn Shapes" — the card's only announced text. */
  ariaLabel: string;
  dir: "rtl" | "ltr";
  index: number;
}

type ClayVars = CSSProperties & Record<`--${string}`, string>;

/**
 * One course on a character's hub (phone): a big clay card in the course's
 * colour with its things piled on top, then its name, a round play button
 * and how far the child has got. A locked course is the same card in white
 * clay with a padlock in place of play, and is not a link.
 */
export function CourseCard({ lesson, characterId, name, description, ariaLabel, dir, index }: CourseCardProps) {
  const { id, theme, totalItems, locked } = lesson;

  /* Every card is WHITE clay (direct request 2026-10-02: a different colour
     per card was too much); the course's colour lives in its play button
     and its progress bar. */
  const style: ClayVars = { animationDelay: `${0.25 + index * 0.12}s` };
  const play: ClayVars = { backgroundColor: theme.accent, "--clay-edge": theme.accentDark };

  const body = (
    <>
      <CourseArt
        images={courseCovers(id)}
        width={250}
        className={`mx-auto -mt-3 mb-2 aspect-[2/1] w-[70%] ${locked ? "path-art-locked" : ""}`}
      />
      <div className="flex items-center gap-3">
        <div dir={dir} className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-tight text-[var(--color-ink)]">
            {name}
          </h2>
          <p className="mt-0.5 truncate text-sm text-[var(--color-ink-soft)]">
            {description}
          </p>
        </div>
        {locked ? (
          <span className="lock-chip h-14 w-14 shrink-0" aria-hidden>
            <Lock className="h-5 w-5" strokeWidth={2.75} />
          </span>
        ) : (
          <span className="clay flex h-14 w-14 shrink-0 items-center justify-center rounded-full" style={play} aria-hidden>
            <Play className="ml-0.5 h-6 w-6 fill-current" style={{ color: theme.ink }} strokeWidth={0} />
          </span>
        )}
      </div>
      {!locked && (
        <CourseProgress characterId={characterId} lessonId={id} total={totalItems} fill={{ face: theme.accent, edge: theme.accentDark }} className="mt-4" />
      )}
    </>
  );

  const cardClass = `card card-clay-white anim-fade-up block px-5 pb-5 ${locked ? "" : "card-lift"}`;

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
