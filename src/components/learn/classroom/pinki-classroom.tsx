"use client";

import { useState, ViewTransition } from "react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { Play, RotateCcw } from "lucide-react";
import { Chalkboard } from "@/components/learn/classroom/chalkboard";
import { useUpNext, type UpNextCourse } from "@/components/learn/up-next";
import { itemKey, useProgress } from "@/store/progress";
import pinkiWithStick from "../../../../public/assets/learn-with-pinki/pinki/pinki-with-a-stick.png";

export interface ClassCourse extends UpNextCourse {
  description: string;
  /** The course's one 3D thing (`classroomModels`). */
  model: StaticImageData;
}

interface PinkiClassroomProps {
  characterId: string;
  courses: readonly ClassCourse[];
  labels: {
    /** "Pinki's Class", on the sign over the board. */
    sign: string;
    hello: string;
    ask: string;
    start: string;
    continue: string;
    /** A finished course's button. */
    again: string;
    /** "Start {name}" with the course's name in it, per course. */
    open: readonly string[];
    pinki: string;
  };
  dir: "rtl" | "ltr";
}

/**
 * Pinki's hub as her classroom (2026-10-14): her board under its sign, with
 * her hello in chalk and a box per course holding only what a child needs
 * — the course's one 3D thing, its short name, a few words on it, how far
 * along it is, and one button (Start / Continue / Play again); the next
 * course's box in pink chalk, a chalk arrow at its button. No stars here:
 * a star means something only where it was earned (the course's board) —
 * and Pinki
 * beside it, her stick raised to the board (her own pose; it does not
 * move — direct request 2026-10-14). A panel
 * is the course's link: the board zooms up into the course page
 * (`Chalkboard`'s view transition) as Pinki steps out of the picture.
 */
export function PinkiClassroom({ characterId, courses, labels, dir }: PinkiClassroomProps) {
  const items = useProgress((state) => state.items);
  const hydrated = useProgress((state) => state.hydrated);
  const next = useUpNext(characterId, courses);
  const [jumps, setJumps] = useState(0);
  const nextIndex = next ? courses.indexOf(next.course) : -1;

  const learned = courses.map((course) =>
    course.titles.map((_, i) => hydrated && (items[itemKey(characterId, course.id, i + 1)]?.stars ?? 0) > 0),
  );

  return (
    <div className="class-hub">
      <div className="class-stage">
        <ViewTransition exit="class-sign-exit" default="none">
          <span dir={dir} className="class-sign">
            {labels.sign}
          </span>
        </ViewTransition>
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
                  className={`chalk-panel ${i === nextIndex ? "chalk-panel--next" : ""}`}
                  style={{ animationDelay: `${0.75 + i * 0.2}s` }}
                >
                  <span className="chalk-panel-model">
                    <Image src={course.model} alt="" fill sizes="(min-width: 1024px) 12rem, 7rem" className="object-contain" />
                  </span>
                  <span dir={dir} className="chalk-panel-text">
                    <span className="chalk-heading">{course.name}</span>
                    <span className="chalk-panel-desc line-clamp-2">{course.description}</span>
                    <span className="chalk-progress" aria-hidden>
                      <span className="chalk-progress-track">
                        <span className="chalk-progress-fill" style={{ width: `${(done / course.titles.length) * 100}%` }} />
                      </span>
                      <span className="chalk-progress-count">
                        {done}/{course.titles.length}
                      </span>
                    </span>
                  </span>
                  <span className={`btn3d chalk-go ${finished ? "chalk-go--done" : ""}`} aria-hidden>
                    {i === nextIndex && <span className="chalk-arrow" />}
                    {finished ? <RotateCcw className="h-4 w-4" strokeWidth={3} /> : <Play className="h-4 w-4 fill-current" strokeWidth={2.5} />}
                    <span>{finished ? labels.again : done ? labels.continue : labels.start}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </Chalkboard>

        {/* Pinki, her stick raised to the board. She steps out of the
            picture when the board zooms into a course. */}
        <ViewTransition exit="pinki-exit" default="none">
          <div className="class-pinki">
            <button
              type="button"
              aria-label={labels.pinki}
              className="class-pinki-body"
              onClick={() => setJumps((n) => n + 1)}
            >
              <span key={jumps} className={`block ${jumps ? "anim-jump" : ""}`}>
                <Image src={pinkiWithStick} alt="" preload sizes="(min-width: 1024px) 340px, 40vw" className="anim-breathe h-auto w-full" />
              </span>
            </button>
          </div>
        </ViewTransition>
      </div>
    </div>
  );
}
