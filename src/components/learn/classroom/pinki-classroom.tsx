"use client";

import { useEffect, useRef, useState, ViewTransition } from "react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { Check, Play } from "lucide-react";
import { Chalkboard } from "@/components/learn/classroom/chalkboard";
import { CourseArt } from "@/components/learn/course-art";
import { useUpNext, type UpNextCourse } from "@/components/learn/up-next";
import { itemKey, useProgress } from "@/store/progress";
import pinkiSpeak from "../../../../public/assets/learn-with-pinki/pinki/pinki-speak.png";
import pointer from "../../../../public/assets/learn/pinki/classroom/pointer.png";

/** Where Pinki's raised hand is, as a share of her picture — the pointer's
    pivot. */
const HAND = { x: 0.116, y: 0.28 };

/** `el`'s top-left inside `root`, by layout offsets — unmoved by the
    entrance animations' transforms, so it is right mid-animation too. */
function offsetIn(el: HTMLElement, root: HTMLElement) {
  let x = 0;
  let y = 0;
  for (let node: HTMLElement | null = el; node && node !== root; node = node.offsetParent as HTMLElement | null) {
    x += node.offsetLeft;
    y += node.offsetTop;
  }
  return { x, y };
}

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
  const stageRef = useRef<HTMLDivElement>(null);
  const pinkiRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const nextIndex = next ? courses.indexOf(next.course) : 0;
  const pointAt = aim ?? nextIndex;
  /* Swing the pointer onto the panel: the angle from her hand to the
     panel's top corner nearest her — clear of its name and its button —
     measured, so it lands at every screen size. The stylesheet's angles
     stand in until then. */
  useEffect(() => {
    const aimPointer = () => {
      const stage = stageRef.current;
      const pinki = pinkiRef.current;
      const panel = panelRefs.current[pointAt];
      if (!stage || !pinki || !panel) return;
      const from = offsetIn(pinki, stage);
      const to = offsetIn(panel, stage);
      const hand = { x: from.x + pinki.offsetWidth * HAND.x, y: from.y + pinki.offsetHeight * HAND.y };
      const target = { x: to.x + panel.offsetWidth * 0.94, y: to.y + panel.offsetHeight * 0.16 };
      const degrees = (Math.atan2(hand.y - target.y, hand.x - target.x) * 180) / Math.PI;
      pinki.style.setProperty("--aim", `${degrees.toFixed(1)}deg`);
    };
    aimPointer();
    window.addEventListener("resize", aimPointer);
    return () => window.removeEventListener("resize", aimPointer);
  }, [pointAt]);

  const learned = courses.map((course) =>
    course.titles.map((_, i) => hydrated && (items[itemKey(characterId, course.id, i + 1)]?.stars ?? 0) > 0),
  );

  return (
    <div className="class-hub">
      <div ref={stageRef} className="class-stage">
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
                  ref={(el) => {
                    panelRefs.current[i] = el;
                  }}
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
          <div ref={pinkiRef} className="class-pinki" data-aim={pointAt}>
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
