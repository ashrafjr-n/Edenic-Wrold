"use client";

import { useState, ViewTransition } from "react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { Check, Play } from "lucide-react";
import { Chalkboard } from "@/components/learn/classroom/chalkboard";
import { CourseArt } from "@/components/learn/course-art";
import { useUpNext, type UpNextCourse } from "@/components/learn/up-next";
import { itemKey, useProgress } from "@/store/progress";
import pinkiSpeak from "../../../../public/assets/learn-with-pinki/pinki/pinki-speak.png";
import pointer from "../../../../public/assets/learn/pinki/classroom/pointer.png";

export interface ClassCourse extends UpNextCourse {
  description: string;
  /** The course's things, piled on its panel (`courseCovers`). */
  art: StaticImageData[];
}

interface PinkiClassroomProps {
  characterId: string;
  courses: readonly ClassCourse[];
  labels: {
    hello: string;
    ask: string;
    start: string;
    continue: string;
    /** "Start {name}" with the course's name in it, per course. */
    open: readonly string[];
    pinki: string;
  };
  dir: "rtl" | "ltr";
}

/**
 * Pinki's hub as her classroom (2026-10-14): her board, with her hello in
 * chalk and a panel per course — its things stuck on, its name, a chalk dot
 * per lesson (filled once learned) — and Pinki beside it, her pointer on
 * the course to play next, or on the one under the child's finger. A panel
 * is the course's link: the board zooms up into the course page
 * (`Chalkboard`'s view transition) as Pinki steps out of the picture.
 */
export function PinkiClassroom({ characterId, courses, labels, dir }: PinkiClassroomProps) {
  const items = useProgress((state) => state.items);
  const hydrated = useProgress((state) => state.hydrated);
  const next = useUpNext(characterId, courses);
  const [aim, setAim] = useState<number | null>(null);
  const [jumps, setJumps] = useState(0);

  const nextIndex = next ? courses.indexOf(next.course) : 0;
  const pointAt = aim ?? nextIndex;
  const learned = courses.map((course) =>
    course.titles.map((_, i) => hydrated && (items[itemKey(characterId, course.id, i + 1)]?.stars ?? 0) > 0),
  );

  return (
    <div className="class-hub">
      <div className="class-stage">
        <Chalkboard size="hub" className="class-board">
          <div dir={dir} className="class-hello">
            <h1 className="chalk-title">{labels.hello}</h1>
            <p className="chalk-sub">{labels.ask}</p>
          </div>

          <div className="class-panels">
            {courses.map((course, i) => {
              const done = learned[i].filter(Boolean).length;
              const finished = done === course.titles.length;
              return (
                <Link
                  key={course.id}
                  href={`/learn/${characterId}/${course.id}`}
                  aria-label={labels.open[i]}
                  className={`chalk-panel ${i === nextIndex && next ? "chalk-panel--next" : ""}`}
                  style={{ animationDelay: `${0.75 + i * 0.2}s` }}
                  onPointerEnter={() => setAim(i)}
                  onPointerLeave={() => setAim(null)}
                  onFocus={() => setAim(i)}
                  onBlur={() => setAim(null)}
                >
                  <CourseArt images={course.art} width={220} className="chalk-panel-art" />
                  <span dir={dir} className="chalk-panel-text">
                    <span className="chalk-heading">{course.name}</span>
                    <span className="chalk-panel-desc line-clamp-1 sm:line-clamp-2">{course.description}</span>
                    <span className="chalk-dots" aria-hidden>
                      {learned[i].map((on, n) => (
                        <span key={n} className={on ? "chalk-dot chalk-dot--on" : "chalk-dot"} />
                      ))}
                    </span>
                  </span>
                  <span className={`chalk-go ${finished ? "chalk-go--done" : ""}`} aria-hidden>
                    {finished ? (
                      <Check className="h-5 w-5" strokeWidth={3} />
                    ) : (
                      <>
                        <span className="chalk-go-label">{done ? labels.continue : labels.start}</span>
                        <Play className="h-4 w-4 fill-current" strokeWidth={2.5} />
                      </>
                    )}
                  </span>
                </Link>
              );
            })}
          </div>
        </Chalkboard>

        {/* Pinki, her pointer on a panel: it swings to the next course, or
            to the one under the child's finger. She steps out of the
            picture when the board zooms into a course. */}
        <ViewTransition exit="pinki-exit" default="none">
          <div className="class-pinki" data-aim={pointAt}>
            <span className="class-pointer" aria-hidden>
              <Image src={pointer} alt="" sizes="(min-width: 1024px) 320px, 40vw" className="h-auto w-full" />
            </span>
            <button
              type="button"
              aria-label={labels.pinki}
              className="class-pinki-body"
              onClick={() => setJumps((n) => n + 1)}
            >
              <span key={jumps} className={`block ${jumps ? "anim-jump" : ""}`}>
                <Image src={pinkiSpeak} alt="" preload sizes="(min-width: 1024px) 340px, 40vw" className="anim-breathe h-auto w-full" />
              </span>
            </button>
          </div>
        </ViewTransition>
      </div>
    </div>
  );
}
