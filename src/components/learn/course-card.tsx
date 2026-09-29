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

  const style: ClayVars = {
    animationDelay: `${0.25 + index * 0.12}s`,
    ...(locked ? {} : { backgroundColor: theme.accent, "--clay-edge": theme.accentDark }),
  };

  const body = (
    <>
      <CourseArt
        images={courseCovers(id)}
        width={250}
        className={`mx-auto -mt-3 mb-2 aspect-[2/1] w-[70%] ${locked ? "path-art-locked" : ""}`}
      />
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <h2 className={`text-2xl font-bold leading-tight ${locked ? "text-[var(--color-ink)]" : "clay-title text-white"}`}>
            {name}
          </h2>
          <p
            dir={dir}
            className={`mt-0.5 truncate text-sm ${locked ? "text-[var(--color-ink-soft)]" : "text-white/90"}`}
          >
            {description}
          </p>
        </div>
        {locked ? (
          <span className="lock-chip h-14 w-14 shrink-0" aria-hidden>
            <Lock className="h-5 w-5" strokeWidth={2.75} />
          </span>
        ) : (
          <span className="btn3d btn3d--clay-white h-14 w-14 shrink-0" aria-hidden>
            <Play className="ml-0.5 h-6 w-6" style={{ color: theme.accent, fill: theme.accent }} strokeWidth={0} />
          </span>
        )}
      </div>
      {!locked && (
        <CourseProgress characterId={characterId} lessonId={id} total={totalItems} className="mt-4" />
      )}
    </>
  );

  const cardClass = `card anim-fade-up block px-5 pb-5 ${locked ? "card-clay-white" : "clay card-lift"}`;

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
