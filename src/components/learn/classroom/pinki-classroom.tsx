"use client";

import { useState, ViewTransition } from "react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { Play, RotateCcw } from "lucide-react";
import { Chalkboard } from "@/components/learn/classroom/chalkboard";
import { useUpNext, type UpNextCourse } from "@/components/learn/up-next";
import { Celebration } from "@/components/ui/celebration";
import { format } from "@/lib/format-dict";
import { itemKey, useProgress } from "@/store/progress";
import pinkiWithStick from "../../../../public/assets/learn-with-pinki/pinki/pinki-with-a-stick.png";
import pinkiCelebrate from "../../../../public/assets/learn-with-pinki/pinki/pinki-celebrate.png";
import chalkStar from "../../../../public/assets/learn/pinki/classroom/chalk-star.png";
import chalkHeart from "../../../../public/assets/learn/pinki/classroom/chalk-heart.png";
import chalkSun from "../../../../public/assets/learn/pinki/classroom/chalk-sun.png";
import chalkSmile from "../../../../public/assets/learn/pinki/classroom/chalk-smile.png";
import chalkBurst from "../../../../public/assets/learn/pinki/classroom/chalk-burst.png";
import chalkUnderline from "../../../../public/assets/learn/pinki/classroom/chalk-underline.png";

export interface ClassCourse extends UpNextCourse {
  /** The course's one 3D thing (`classroomModels`). */
  model: StaticImageData;
}

interface PinkiClassroomProps {
  characterId: string;
  courses: readonly ClassCourse[];
  labels: {
    /** "Pinki's Class", on the sign over the board. */
    sign: string;
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
    pinki: string;
  };
  dir: "rtl" | "ltr";
}

/** The chalk doodles round the cards — drawn by hand (`chalk.py`), never
    icons — placed by `.class-doodles img:nth-child(n)`. */
const DOODLES = [chalkStar, chalkHeart, chalkSun, chalkBurst, chalkStar, chalkHeart];

/**
 * Pinki's hub as her classroom (2026-10-14): her board under its sign, a
 * square paper card per course stuck on it side by side — the course's
 * name on a clay tag, its one 3D thing, how far along it is, one button
 * (Start / Continue / Play again). What a course teaches stays inside it:
 * a card never lists its lessons. The next course's card glows pink.
 * Chalk doodles drawn by hand round the cards and "You can do it!" under
 * them.
 *
 * Pinki stands beside the board, her stick raised to it (her own pose; it
 * does not move — direct request), and jumps when tapped; she says
 * nothing. When every lesson is learned she celebrates instead, and the
 * board says so.
 *
 * A card is the course's link: the board zooms up into the course page
 * (`Chalkboard`'s view transition) as Pinki steps out of the picture.
 */
export function PinkiClassroom({ characterId, courses, labels, dir }: PinkiClassroomProps) {
  const items = useProgress((state) => state.items);
  const hydrated = useProgress((state) => state.hydrated);
  const next = useUpNext(characterId, courses);
  const [jumps, setJumps] = useState(0);
  const nextIndex = next ? courses.indexOf(next.course) : -1;
  const allDone = hydrated && !next;

  const learned = courses.map(
    (course) =>
      course.titles.filter((_, i) => hydrated && (items[itemKey(characterId, course.id, i + 1)]?.stars ?? 0) > 0).length,
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
          {allDone && <Celebration />}
          <span className="class-doodles" aria-hidden>
            {DOODLES.map((doodle, i) => (
              <Image key={i} src={doodle} alt="" width={56} height={56} />
            ))}
          </span>

          <div className="class-cards">
            {courses.map((course, i) => {
              const done = learned[i];
              const finished = done === course.titles.length;
              const announce = finished ? labels.replayCourse : done ? labels.continueCourse : labels.startCourse;
              return (
                <Link
                  key={course.id}
                  href={`/learn/${characterId}/${course.id}`}
                  aria-label={format(announce, { name: course.name })}
                  className={`class-card ${i === nextIndex ? "class-card--next" : ""}`}
                  style={{ animationDelay: `${0.7 + i * 0.18}s` }}
                >
                  <span dir={dir} className="class-card-tag">
                    {course.name}
                  </span>
                  <span className="class-card-model">
                    <Image src={course.model} alt="" fill sizes="(min-width: 1024px) 15rem, 30vw" className="object-contain" />
                  </span>
                  <span className="class-card-progress" aria-hidden>
                    <span className="class-card-track">
                      <span className="class-card-fill" style={{ width: `${(done / course.titles.length) * 100}%` }} />
                    </span>
                    {done}/{course.titles.length}
                  </span>
                  <span className={`btn3d class-card-go ${finished ? "class-card-go--done" : ""}`} aria-hidden>
                    {finished ? <RotateCcw className="h-4 w-4" strokeWidth={3} /> : <Play className="h-4 w-4 fill-current" strokeWidth={2.5} />}
                    <span>{finished ? labels.again : done ? labels.continue : labels.start}</span>
                  </span>
                </Link>
              );
            })}
          </div>

          <p dir={dir} className={`class-cheer ${allDone ? "class-cheer--done" : ""}`}>
            <span className="class-cheer-words">
              <span className="chalk-title">{allDone ? labels.allDone : labels.cheer}</span>
              <span className="class-cheer-line" aria-hidden>
                <Image src={chalkUnderline} alt="" fill sizes="24rem" />
              </span>
            </span>
            <Image src={chalkSmile} alt="" width={44} height={44} className="class-cheer-smile" />
          </p>
        </Chalkboard>

        {/* Pinki, her stick raised to the board — or celebrating, once
            everything is learned. She steps out of the picture when the
            board zooms into a course. */}
        <ViewTransition exit="pinki-exit" default="none">
          <div className="class-pinki">
            <button
              type="button"
              aria-label={labels.pinki}
              className="class-pinki-body"
              onClick={() => setJumps((n) => n + 1)}
            >
              <span key={jumps} className={`block ${jumps ? "anim-jump" : ""}`}>
                <Image
                  src={allDone ? pinkiCelebrate : pinkiWithStick}
                  alt=""
                  preload
                  sizes="(min-width: 1024px) 340px, 40vw"
                  className="anim-breathe h-auto w-full"
                />
              </span>
            </button>
          </div>
        </ViewTransition>
      </div>
    </div>
  );
}
