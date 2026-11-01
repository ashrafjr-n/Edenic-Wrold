import type { CSSProperties } from "react";
import Image, { type StaticImageData } from "next/image";
import { Celebration } from "@/components/ui/celebration";
import { COLORS } from "@/data/colors";
import type { ColorId, Face } from "@/types/course";
import type { StrokePoint } from "@/types/stroke";
import { FaceView } from "./face";
import { ClayWord, type LetterTone } from "./clay-word";
import chalkStar from "../../../../public/assets/learn/classroom/chalk-star.png";
import chalkHeart from "../../../../public/assets/learn/classroom/chalk-heart.png";
import chalkSun from "../../../../public/assets/learn/classroom/chalk-sun.png";
import chalkSmile from "../../../../public/assets/learn/classroom/chalk-smile.png";
import chalkBurst from "../../../../public/assets/learn/classroom/chalk-burst.png";

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
}

/* The party round the board — fixed tables, never `Math.random()` (this
   renders on the server too). Balloons keep to the board's sides, clear of
   the friend and the words; `start` puts some already up when it opens. */
const BALLOONS: { color: ColorId; lane: number; size: number; rise: number; start: number }[] = [
  { color: "red", lane: 5, size: 13, rise: 11, start: 3 },
  { color: "yellow", lane: 15, size: 10, rise: 13, start: 8 },
  { color: "blue", lane: 26, size: 9, rise: 15, start: 1 },
  { color: "green", lane: 74, size: 9, rise: 14, start: 6 },
  { color: "purple", lane: 85, size: 11, rise: 12, start: 10 },
  { color: "orange", lane: 95, size: 13, rise: 10, start: 4 },
  { color: "pink", lane: 50, size: 8, rise: 17, start: 12 },
];

/* Confetti falling over the whole board, a few at a time, for good. */
const RAIN = [
  { x: 4, fall: 5.2, delay: 0, spin: 340, color: "var(--color-pinki)" },
  { x: 11, fall: 6.1, delay: 1.7, spin: -280, color: "var(--color-gold)" },
  { x: 19, fall: 4.8, delay: 0.6, spin: 300, color: "var(--brand)" },
  { x: 27, fall: 5.6, delay: 2.9, spin: -360, color: "var(--color-go)" },
  { x: 34, fall: 6.4, delay: 1.1, spin: 260, color: "var(--color-bloo)" },
  { x: 42, fall: 5, delay: 3.6, spin: -300, color: "var(--color-pinki)" },
  { x: 49, fall: 5.8, delay: 0.3, spin: 320, color: "var(--color-gold)" },
  { x: 56, fall: 4.9, delay: 2.2, spin: -260, color: "var(--color-go)" },
  { x: 63, fall: 6.2, delay: 1.4, spin: 380, color: "var(--brand)" },
  { x: 71, fall: 5.3, delay: 3.1, spin: -340, color: "var(--color-pinki)" },
  { x: 78, fall: 5.9, delay: 0.8, spin: 280, color: "var(--color-bloo)" },
  { x: 86, fall: 4.7, delay: 2.6, spin: -320, color: "var(--color-gold)" },
  { x: 93, fall: 6, delay: 1.9, spin: 300, color: "var(--color-go)" },
  { x: 98, fall: 5.4, delay: 0.1, spin: -280, color: "var(--brand)" },
];

/* Chalk doodles drawn round the edges, one after another. */
const DOODLES = [
  { src: chalkStar, x: 6, y: 10, size: 3.2, delay: 0.5 },
  { src: chalkSun, x: 92, y: 9, size: 3.6, delay: 0.7 },
  { src: chalkHeart, x: 9, y: 82, size: 2.8, delay: 0.9 },
  { src: chalkBurst, x: 91, y: 80, size: 3, delay: 1.1 },
  { src: chalkSmile, x: 33, y: 7, size: 2.6, delay: 1.3 },
  { src: chalkStar, x: 68, y: 90, size: 2.4, delay: 1.5 },
];

/**
 * The end of a lesson (redone 2026-11-02 — "a big celebration, no stars or
 * rewards"): the friend BIG — as big as on the friend picker — hopping for
 * joy on a glowing disc, "Lesson complete!" in big chalk and what was
 * learned (the thing, the child's own drawing, the word), with the whole
 * board a party round them: balloons rising up its sides, confetti falling
 * over it, chalk doodles drawn round its edges.
 *
 * Again / Next are the player's, in the action band as on every step.
 * Phone: stacked, the friend on top. Desktop: side by side.
 */
export function LessonDone({ title, words, faces, drawing, accent, cheer, dir }: LessonDoneProps) {
  return (
    <>
      <DoneParty />
      <div className="relative mb-auto flex w-full max-w-md flex-col items-center gap-2 text-center sm:mb-0 sm:gap-3 lg:grid lg:max-w-5xl lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-center lg:gap-x-10">
        <div className="relative flex items-end justify-center">
          <span
            aria-hidden
            className="done-glow absolute bottom-[4%] left-1/2 aspect-square h-[78%] -translate-x-1/2 rounded-full"
            style={{ backgroundColor: accent }}
          />
          <span className="anim-pop-in relative block">
            <Image
              src={cheer}
              alt=""
              sizes="(min-width: 1024px) 360px, 260px"
              preload
              className="done-hop relative h-[min(16rem,30svh)] w-auto object-contain drop-shadow-[0_14px_18px_rgba(0,0,0,0.3)] sm:h-[min(18rem,30svh)] lg:h-[min(22rem,calc(var(--stage-h)*0.95))]"
            />
          </span>
          <Celebration />
        </div>

        <div className="anim-pop-in flex w-full flex-col items-center gap-3 [animation-delay:0.35s] lg:gap-5 [@media(max-height:700px)]:gap-2">
          <p dir={dir} className="chalk-title done-title">
            {title}
          </p>
          <Learned words={words} faces={faces} drawing={drawing} accent={accent} />
        </div>
      </div>
    </>
  );
}

/** The party behind everything on the board — balloons, confetti, chalk
    doodles. It sits under the step's content and buttons, never in a tap's
    way. */
function DoneParty() {
  return (
    <div className="done-party" aria-hidden>
      {DOODLES.map((doodle, i) => (
        <Image
          key={i}
          src={doodle.src}
          alt=""
          width={56}
          height={56}
          className="done-doodle"
          style={{ left: `${doodle.x}%`, top: `${doodle.y}%`, width: `${doodle.size}rem`, animationDelay: `${doodle.delay}s` }}
        />
      ))}
      {RAIN.map((piece, i) => (
        <span
          key={i}
          className="done-rain"
          style={
            {
              left: `${piece.x}%`,
              backgroundColor: piece.color,
              animationDuration: `${piece.fall}s`,
              animationDelay: `${piece.delay}s`,
              "--rain-spin": `${piece.spin}deg`,
            } as CSSProperties
          }
        />
      ))}
      {BALLOONS.map((balloon) => (
        <span
          key={balloon.color}
          className="balloon-rise absolute top-0"
          style={{
            left: `${balloon.lane}%`,
            width: `${balloon.size}cqmin`,
            animationDuration: `${balloon.rise}s`,
            animationDelay: `-${balloon.start}s`,
          }}
        >
          <span className="balloon-sway block" style={{ animationDelay: `-${balloon.start * 0.4}s` }}>
            <Image src={COLORS[balloon.color].balloon} alt="" sizes="8rem" className="h-auto w-full" />
          </span>
        </span>
      ))}
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
