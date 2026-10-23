import type { CSSProperties } from "react";
import Image, { type StaticImageData } from "next/image";
import { Star } from "lucide-react";
import { Celebration } from "@/components/ui/celebration";
import type { Face } from "@/types/course";
import type { StrokePoint } from "@/types/stroke";
import { FaceView } from "./face";
import { ClayWord, type LetterTone } from "./clay-word";

interface LessonDoneProps {
  /** "Lesson complete!" */
  title: string;
  /** The taught words ("circle"; "red", "blue"), none for a review. */
  words: { word: string; tone?: LetterTone }[];
  /** What the lesson was about — a shape, two colors' pots, or a review's
      four. */
  faces: Face[];
  /** The child's own passing trace, drawn back beside the shape. */
  drawing?: readonly StrokePoint[];
  accent: string;
  /** The friend celebrating (`CLASSROOMS[id].cheer`). */
  cheer: StaticImageData;
  dir: "rtl" | "ltr";
  /** The stars the lesson earned, of 3 — the same stars then fly into the
      lesson's box on the course's board. */
  stars: number;
}

/**
 * The end of a lesson, as one celebration in two beats, top to bottom:
 *
 * 1. The friend cheering on a glowing clay disc, confetti bursting round them.
 * 2. What was learned: the shape, the child's OWN drawing of it (the most
 *    personal reward there is — no stars or points before sign-in), and the
 *    word in clay letters.
 *
 * (A green "X is open!" pill under them was removed on request — the course
 * page's walk already shows the next lesson opening.)
 *
 * The beats arrive one after another (`animation-delay`); Again / Next are the
 * player's, in the action band as on every step.
 *
 * It is written up on the friend's board (2026-10-23): the title in chalk,
 * the stars the lesson earned, the word on its paper strip. Pinned to the
 * top (`mb-auto`) on a phone.
 *
 * Desktop: the board spans the whole width here (no side panels), so the
 * beats sit side by side — the friend on the left, what was learned on the
 * right.
 */
export function LessonDone({ title, words, faces, drawing, accent, cheer, dir, stars }: LessonDoneProps) {
  const learned = <Learned words={words} faces={faces} drawing={drawing} accent={accent} />;
  return (
    <div className="relative mb-auto flex w-full max-w-sm flex-col items-center gap-3 text-center sm:mb-0 sm:max-w-md lg:grid lg:max-w-4xl lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:content-center lg:items-center lg:gap-x-12 lg:gap-y-5 [@media(max-height:700px)]:gap-2">
      <div className="relative flex items-end justify-center lg:row-span-2">
        <span
          aria-hidden
          className="done-glow absolute bottom-0 left-1/2 aspect-square h-[88%] -translate-x-1/2 rounded-full"
          style={{ backgroundColor: accent }}
        />
        <Image
          src={cheer}
          alt=""
          sizes="(min-width: 1024px) 320px, 180px"
          preload
          className="anim-pop-in relative h-[min(7rem,12svh)] w-auto object-contain sm:h-[min(7rem,11svh)] lg:h-[min(14rem,24svh)]"
        />
        <Celebration />
      </div>

      <div className="anim-pop-in w-full [animation-delay:0.35s] lg:row-span-2">
        <div className="flex flex-col items-center gap-3 px-5 pb-3 pt-2 lg:gap-4 lg:px-8 lg:py-4 [@media(max-height:700px)]:gap-2 [@media(max-height:700px)]:py-1">
          <p dir={dir} className="chalk-title anim-fade-up" style={{ animationDelay: "0.2s" }}>
            {title}
          </p>
          <span className="done-stars" aria-hidden>
            {[1, 2, 3].map((k) => (
              <Star
                key={k}
                className={`board-star ${k <= stars ? "board-star--on" : ""}`}
                style={{ animationDelay: `${0.7 + k * 0.18}s` }}
                strokeWidth={2.25}
              />
            ))}
          </span>
          {learned}
        </div>
      </div>
    </div>
  );
}

type LearnedProps = Pick<LessonDoneProps, "words" | "faces" | "drawing" | "accent">;

/** What was learned: the things, the child's drawing, the word. */
function Learned({ words, faces, drawing, accent }: LearnedProps) {
  /* One or two things and a drawing get big tiles; a review's four things
     and a drawing (five in a row) share the card's width. */
  const tile = faces.length > 2 ? "h-[min(3.25rem,8svh)] w-[min(3.25rem,8svh)] lg:h-[min(4.5rem,9svh)] lg:w-[min(4.5rem,9svh)]" : "h-[min(5.5rem,10svh)] w-[min(5.5rem,10svh)] lg:h-[min(7rem,12svh)] lg:w-[min(7rem,12svh)]";
  const wordRow = words.length > 0 && (
    <div className={`flex flex-wrap items-center justify-center ${words.length > 1 ? "gap-x-5 gap-y-1 [&>span]:text-4xl sm:[&>span]:text-5xl" : ""}`}>
      {words.map(({ word, tone }) => (
        <ClayWord key={word} word={word} size="sm" tone={tone} />
      ))}
    </div>
  );
  return (
    <>
      <div className={`flex items-center justify-center ${faces.length > 2 ? "gap-2" : "gap-3"}`}>
        {faces.map((face) => (
          <span
            key={face.kind === "shape" ? face.shape : face.kind === "picture" ? face.src.src : face.text}
            className={`tile flex items-center justify-center ${tile}`}
            style={{ "--tile-tint": "var(--background)" } as CSSProperties}
          >
            <FaceView face={face} size="tile" />
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
      {wordRow}
    </>
  );
}
