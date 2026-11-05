"use client";

import type { CSSProperties, MouseEvent } from "react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Play, RotateCcw } from "lucide-react";
import { useUpNext, type UpNextCourse } from "@/components/learn/up-next";
import { COURSE_STOPS } from "@/data/course-stops";
import { TRAIL_COVER_MS, usePageTransition } from "@/store/page-transition";
import type { LessonId } from "@/types/lesson";
import { Celebration } from "@/components/ui/celebration";
import { format } from "@/lib/format-dict";
import { itemKey, useProgress } from "@/store/progress";
import chalkStar from "../../../../public/assets/learn/classroom/chalk-star.png";
import chalkHeart from "../../../../public/assets/learn/classroom/chalk-heart.png";
import chalkSun from "../../../../public/assets/learn/classroom/chalk-sun.png";
import chalkSmile from "../../../../public/assets/learn/classroom/chalk-smile.png";
import chalkBurst from "../../../../public/assets/learn/classroom/chalk-burst.png";
import chalkUnderline from "../../../../public/assets/learn/classroom/chalk-underline.png";

interface ClassCourse extends UpNextCourse {
  /** The course's one 3D thing (`classroomModels`). */
  model: StaticImageData;
}

interface ClassCoursesProps {
  characterId: string;
  courses: readonly ClassCourse[];
  labels: {
    /** "{n} lessons", under a course's name. */
    lessons: string;
    /** "You can do it!", written under the cards. */
    cheer: string;
    start: string;
    continue: string;
    /** A finished course's button. */
    again: string;
    /** "{name}" templates: how a course's card is announced, by where the
        child is in it. */
    startCourse: string;
    continueCourse: string;
    replayCourse: string;
    /** On the board, in place of the cheer, once every lesson is learned. */
    allDone: string;
  };
  dir: "rtl" | "ltr";
}

/** The chalk doodles beside the cards — drawn by hand (`chalk.py`), never
    icons: a star and a heart at the left, a smiling sun and "look here"
    dashes at the right, where the friend's stick is. */
const DOODLES = { left: [chalkStar, chalkHeart], right: [chalkSun, chalkBurst] };

/** One side's doodles: a column of the cards' grid that only gets the
    board's room the cards leave — none, none drawn. */
function Doodles({ side }: { side: keyof typeof DOODLES }) {
  return (
    <span className={`class-doodles class-doodles--${side}`} aria-hidden>
      {DOODLES[side].map((doodle, i) => (
        <Image key={i} src={doodle} alt="" width={56} height={56} />
      ))}
    </span>
  );
}

/**
 * What a friend's hub writes on their board (Pinki's 2026-10-14; Nova's and
 * Bloo's 2026-10-23): a square paper sheet per course pinned up side by
 * side — the course's name on a clay tag, "5 lessons", its one 3D thing, a
 * dot per lesson, one button (Start / Continue / Play again). What a
 * course teaches stays inside it: a sheet never lists its lessons. The
 * next course's sheet glows. Chalk doodles drawn by hand round the sheets
 * and "You can do it!" under them; once every lesson is learned the board
 * says so.
 *
 * The board, the room and the friend are the classroom's
 * (`ClassroomShell`, the layout): a sheet is the course's link, and the
 * same board then shows that course's lessons, a little closer.
 */
export function ClassCourses({ characterId, courses, labels, dir }: ClassCoursesProps) {
  const items = useProgress((state) => state.items);
  const hydrated = useProgress((state) => state.hydrated);
  const next = useUpNext(characterId, courses);
  const nextIndex = next ? courses.indexOf(next.course) : -1;
  const allDone = hydrated && !next;
  const router = useRouter();
  const startVeil = usePageTransition((state) => state.start);

  /* A course with a world of stops: pink clouds rise over the page (a plain
     click only — a new tab goes as any link goes), then the world. */
  const intoWorld = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    startVeil("pink");
    window.setTimeout(() => router.push(href), TRAIL_COVER_MS);
  };

  const learned = courses.map(
    (course) =>
      course.titles.filter((_, i) => hydrated && (items[itemKey(characterId, course.id, i + 1)]?.stars ?? 0) > 0).length,
  );

  return (
    <>
      {allDone && <Celebration />}
      <div className="class-cards">
        <Doodles side="left" />
        {courses.map((course, i) => {
          const done = learned[i];
          const finished = done === course.titles.length;
          const announce = finished ? labels.replayCourse : done ? labels.continueCourse : labels.startCourse;
          return (
            <Link
              key={course.id}
              href={`/learn/${characterId}/${course.id}`}
              onClick={COURSE_STOPS[course.id as LessonId] ? (event) => intoWorld(event, `/learn/${characterId}/${course.id}`) : undefined}
              aria-label={format(announce, { name: course.name })}
              className={`class-card ${i === nextIndex ? "class-card--next" : ""}`}
              style={{ animationDelay: `${0.7 + i * 0.18}s` }}
            >
              <span dir={dir} className="class-card-tag" style={{ "--chars": course.name.length } as CSSProperties}>
                {course.name}
              </span>
              <span dir={dir} className="class-card-count">
                {format(labels.lessons, { n: course.titles.length })}
              </span>
              <span className="class-card-model">
                <Image src={course.model} alt="" fill sizes="(min-width: 1024px) 15rem, 30vw" className="object-contain" />
              </span>
              {/* One dot per lesson: pink once learned, ringed where
                  the child carries on. */}
              <span className="class-card-dots" aria-hidden>
                {course.titles.map((_, k) => (
                  <span
                    key={k}
                    className={`class-card-dot ${k < done ? "class-card-dot--done" : k === done ? "class-card-dot--next" : ""}`}
                  />
                ))}
              </span>
              <span className={`btn3d class-card-go ${finished ? "class-card-go--done" : ""}`} aria-hidden>
                {finished ? <RotateCcw className="h-4 w-4" strokeWidth={3} /> : <Play className="h-4 w-4 fill-current" strokeWidth={2.5} />}
                <span>{finished ? labels.again : done ? labels.continue : labels.start}</span>
              </span>
            </Link>
          );
        })}
        <Doodles side="right" />
      </div>

      <p dir={dir} className={`class-cheer ${allDone ? "class-cheer--done" : ""}`}>
        <Image src={chalkStar} alt="" width={36} height={36} className="class-cheer-doodle" />
        <span className="class-cheer-words">
          <span className="chalk-title">{allDone ? labels.allDone : labels.cheer}</span>
          <span className="class-cheer-line" aria-hidden>
            <Image src={chalkUnderline} alt="" fill sizes="24rem" />
          </span>
        </span>
        <Image src={chalkSmile} alt="" width={44} height={44} className="class-cheer-smile" />
        <Image src={chalkHeart} alt="" width={36} height={36} className="class-cheer-doodle class-cheer-doodle--heart" />
      </p>
    </>
  );
}
