import type { CSSProperties } from "react";
import Image from "next/image";
import { Lock, LockOpen } from "lucide-react";
import { Celebration } from "@/components/ui/celebration";
import type { ShapeId } from "@/types/course";
import type { StrokePoint } from "@/types/stroke";
import { FaceView } from "./face";
import { ClayWord } from "./clay-word";
import celebrate from "../../../../public/assets/learn-with-pinki/pinki/pinki-celebrate.png";

interface LessonDoneProps {
  /** "Lesson complete!" */
  title: string;
  /** The taught word ("circle"), for a one-shape lesson. */
  word?: string;
  /** The shapes the lesson was about — one, or all four in a review. */
  shapes: ShapeId[];
  /** The child's own passing trace, drawn back beside the shape. */
  drawing?: readonly StrokePoint[];
  accent: string;
  /** "Square is open!" — absent after a course's last lesson. */
  unlocked?: string;
  dir: "rtl" | "ltr";
}

const GO = { backgroundColor: "var(--color-go)", "--clay-edge": "var(--color-go-dark)" } as CSSProperties;

/**
 * The end of a lesson, as one celebration in three beats, top to bottom:
 *
 * 1. Pinki cheering on a glowing clay disc, confetti bursting round her.
 * 2. What was learned: the shape, the child's OWN drawing of it (the most
 *    personal reward there is — no stars or points before sign-in), and the
 *    word in clay letters.
 * 3. What is next: a green pill whose padlock springs open, naming the lesson
 *    it just unlocked.
 *
 * The beats arrive one after another (`animation-delay`); Again / Next are the
 * player's, in the action band as on every step.
 *
 * The done screen has no task button, so the middle of the back row is free:
 * the screen is pinned to the top (`mb-auto`) and Pinki rises into that gap
 * (the negative top margin), which is what lets her be this big on a phone.
 */
export function LessonDone({ title, word, shapes, drawing, accent, unlocked, dir }: LessonDoneProps) {
  /* One shape and a drawing get big tiles; the review's four shapes and a
     drawing (five in a row) share the card's width. */
  const tile = shapes.length > 1 ? "h-[min(3.25rem,8svh)] w-[min(3.25rem,8svh)]" : "h-[min(5.5rem,10svh)] w-[min(5.5rem,10svh)] lg:h-[min(7rem,12svh)] lg:w-[min(7rem,12svh)]";
  return (
    <div className="relative mb-auto -mt-[4.5rem] flex w-full max-w-sm flex-col items-center gap-3 text-center sm:mb-0 sm:mt-0 sm:max-w-md lg:grid lg:max-w-4xl lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:content-center lg:items-center lg:gap-x-12 lg:gap-y-5 [@media(max-height:700px)]:gap-2">
      <div className="relative flex items-end justify-center lg:row-span-3">
        <span
          aria-hidden
          className="done-glow absolute bottom-0 left-1/2 aspect-square h-[88%] -translate-x-1/2 rounded-full"
          style={{ backgroundColor: accent }}
        />
        <Image
          src={celebrate}
          alt=""
          sizes="(min-width: 1024px) 320px, 180px"
          preload
          className="anim-pop-in relative h-[min(11rem,20svh)] w-auto object-contain sm:h-[min(8rem,13svh)] lg:h-[min(20rem,36svh)]"
        />
        <Celebration />
      </div>

      <p dir={dir} className="anim-fade-up text-2xl font-bold text-[var(--color-ink)] sm:text-3xl lg:text-5xl" style={{ animationDelay: "0.2s" }}>
        {title}
      </p>

      <div
        className="card card-clay-white anim-pop-in flex w-full flex-col items-center gap-3 px-5 py-4 [@media(max-height:700px)]:gap-2 [@media(max-height:700px)]:py-3"
        style={{ animationDelay: "0.35s" }}
      >
        <div className={`flex items-center justify-center ${shapes.length > 1 ? "gap-2" : "gap-3"}`}>
          {shapes.map((shape) => (
            <span
              key={shape}
              className={`tile flex items-center justify-center ${tile}`}
              style={{ "--tile-tint": "var(--background)" } as CSSProperties}
            >
              <FaceView face={{ kind: "shape", shape }} size="tile" />
            </span>
          ))}
          {drawing && drawing.length > 1 && (
            <span
              className={`tile flex items-center justify-center p-2 ${tile}`}
              style={{ "--tile-tint": "var(--background)" } as CSSProperties}
            >
              <svg viewBox="0 0 100 100" className="done-drawing h-full w-full" aria-hidden>
                <polyline
                  points={drawing.map(([x, y]) => `${x},${y}`).join(" ")}
                  fill="none"
                  stroke={accent}
                  strokeWidth={9}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength={100}
                />
              </svg>
            </span>
          )}
        </div>
        {word && <ClayWord word={word} size="sm" />}
      </div>

      {unlocked && (
        <div className="clay anim-pop-in flex items-center gap-2 rounded-full py-2 pe-5 ps-2 lg:justify-self-center" style={{ ...GO, animationDelay: "0.8s" }}>
          <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white text-[var(--color-go-dark)] lg:h-10 lg:w-10">
            <Lock className="done-lock absolute h-5 w-5" strokeWidth={2.75} />
            <LockOpen className="done-unlock absolute h-5 w-5" strokeWidth={2.75} />
          </span>
          <span dir={dir} className="text-base font-bold text-white sm:text-lg lg:text-xl">
            {unlocked}
          </span>
        </div>
      )}
    </div>
  );
}
