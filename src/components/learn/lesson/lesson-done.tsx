"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Celebration } from "@/components/ui/celebration";
import type { Face } from "@/types/course";
import type { StrokePoint } from "@/types/stroke";
import { FaceView } from "./face";
import { ClayWord, type LetterTone } from "./clay-word";
import { TASK_ICONS, type TaskKind } from "./task-chip";
import chalkStar from "../../../../public/assets/learn/classroom/chalk-star.png";
import chalkHeart from "../../../../public/assets/learn/classroom/chalk-heart.png";
import chalkSun from "../../../../public/assets/learn/classroom/chalk-sun.png";
import chalkBurst from "../../../../public/assets/learn/classroom/chalk-burst.png";

/** The next lesson, as its sheet on the board (the course page's). */
export interface DoneNext {
  href: string;
  /** "Lesson 2". */
  label: string;
  /** Its name ("Square"). */
  word: string;
  art: readonly StaticImageData[];
  /** "Next shape" / "Next lesson". */
  go: string;
  /** "Start lesson 2: Square", for a screen reader. */
  aria: string;
  /** Run when it is pressed. */
  onGo?: () => void;
}

interface LessonDoneProps {
  /** "Lesson complete!" */
  title: string;
  /** Every step of the lesson, in order — its path, walked. */
  path: readonly TaskKind[];
  /** The taught words ("circle"; "red", "blue"), none for a review. */
  words: { word: string; tone?: LetterTone }[];
  /** What the lesson was about — a shape, two colors' pots, or a review's
      four. */
  faces: Face[];
  /** The child's own passing trace, drawn back beside the shape. */
  drawing?: readonly StrokePoint[];
  /** What the child found (a Find's things). */
  found?: readonly StaticImageData[];
  accent: string;
  /** The friend celebrating (`CLASSROOMS[id].cheer`). */
  cheer: StaticImageData;
  /** The way on — none after a course's last lesson (the player's Finish). */
  next?: DoneNext;
  dir: "rtl" | "ltr";
}

/* A stop is ticked every this long, after the board has come up. */
const STOP_S = 0.32;
const PATH_FROM_S = 0.55;

/* Chalk doodles round the board's corners, drawn once the path is walked
   — fixed, never `Math.random()` (this renders on the server too). */
const DOODLES = [
  { src: chalkStar, x: 6, y: 9, size: 3, turn: -8 },
  { src: chalkSun, x: 6, y: 52, size: 2.6, turn: 6 },
  { src: chalkHeart, x: 7, y: 88, size: 2.6, turn: 10 },
  { src: chalkBurst, x: 94, y: 89, size: 2.8, turn: -4 },
];

/**
 * The end of a lesson — back on the friend's board (2026-11-02,
 * `edenic-plan.md` Phase 7: "the child comes back to the board, sees the
 * lesson's path done, then the way to the next lesson"). In order:
 *
 * 1. The friend cheering, "Lesson complete!" in chalk.
 * 2. The lesson's path drawn in chalk, stop by stop — every step it had,
 *    each ticked in the friend's chalk as the line reaches it.
 * 3. What the child MADE under it: the shape, their own drawing, the
 *    things they found, the word.
 * 4. The next lesson's sheet pinned up — the way on (Play again is the
 *    player's, in the button band).
 *
 * About three seconds, a tap anywhere shows it all at once. No stars.
 */
export function LessonDone({ title, path, words, faces, drawing, found, accent, cheer, next, dir }: LessonDoneProps) {
  const [skip, setSkip] = useState(false);
  /* The confetti, as the last stop is ticked. */
  const [burst, setBurst] = useState(false);
  const walked = PATH_FROM_S + path.length * STOP_S;
  const timing = { "--walked": `${walked}s` } as CSSProperties;

  useEffect(() => {
    const timer = window.setTimeout(() => setBurst(true), walked * 1000);
    return () => window.clearTimeout(timer);
  }, [walked]);

  return (
    <div
      className={`done ${skip ? "done--skip" : ""}`}
      style={timing}
      onPointerDown={() => {
        setSkip(true);
        setBurst(true);
      }}
    >
      <div className="done-doodles" aria-hidden>
        {DOODLES.map((doodle) => (
          <Image
            key={doodle.x * 100 + doodle.y}
            src={doodle.src}
            alt=""
            width={56}
            height={56}
            className="done-doodle"
            style={{ left: `${doodle.x}%`, top: `${doodle.y}%`, width: `${doodle.size}rem`, rotate: `${doodle.turn}deg` }}
          />
        ))}
      </div>

      <div className="done-friend">
        <span aria-hidden className="done-glow" style={{ backgroundColor: accent }} />
        <Image src={cheer} alt="" sizes="(min-width: 1024px) 300px, 140px" preload className="done-hop" />
      </div>

      <div className="done-body">
        <p dir={dir} className="chalk-title done-title">
          {title}
        </p>

        <ol className="done-path" aria-hidden>
          {path.map((kind, i) => {
            const Icon = TASK_ICONS[kind];
            const at = { "--at": `${PATH_FROM_S + i * STOP_S}s` } as CSSProperties;
            return (
              <li key={i} className="done-stop" style={at}>
                {i > 0 && <span className="done-path-line" />}
                <span className="done-stop-dot">
                  <Icon strokeWidth={2.5} />
                  <span className="done-stop-tick">
                    <Check strokeWidth={4} />
                  </span>
                </span>
              </li>
            );
          })}
        </ol>

        <div className="done-made">
          <Made faces={faces} drawing={drawing} found={found} accent={accent} />
          {words.length > 0 && (
            <div className={`flex flex-wrap items-center justify-center ${words.length > 1 ? "gap-x-5 gap-y-1" : ""}`}>
              {words.map(({ word, tone }) => (
                <ClayWord key={word} word={word} size="sm" tone={tone} />
              ))}
            </div>
          )}
        </div>

        {next && (
          <Link href={next.href} onClick={next.onGo} className="board-next done-next lesson-onward" aria-label={next.aria}>
            <span className={`board-cell-art ${next.art.length > 1 ? "board-cell-art--row" : ""}`}>
              {next.art.map((picture) => (
                <span key={picture.src} className="board-magnet">
                  <Image src={picture} alt="" fill sizes="(min-width: 1024px) 8rem, 5rem" className="object-contain" />
                </span>
              ))}
            </span>
            <span dir={dir} className="board-next-text">
              <span className="board-next-label">{next.label}</span>
              <span className="board-next-word">{next.word}</span>
              <span className="btn3d board-next-go">
                <span>{next.go}</span>
                <ArrowRight className="h-5 w-5 rtl:-scale-x-100" strokeWidth={3} />
              </span>
            </span>
          </Link>
        )}
      </div>
      {burst && (
        <span className="done-burst" aria-hidden>
          <Celebration />
        </span>
      )}
    </div>
  );
}

type MadeProps = Pick<LessonDoneProps, "faces" | "drawing" | "found" | "accent">;

/** What was made: the things learned, the child's drawing, what they
    found — each a small tile, pinned up in turn. */
function Made({ faces, drawing, found, accent }: MadeProps) {
  const tint = { "--tile-tint": "var(--background)" } as CSSProperties;
  return (
    <div className="done-tiles">
      {faces.map((face) => (
        <span key={face.kind === "shape" ? face.shape : face.kind === "picture" ? face.src.src : face.text} className="tile done-tile" style={tint}>
          <FaceView face={face} size="tile" />
        </span>
      ))}
      {drawing && drawing.length > 1 && (
        <span className="tile done-tile p-2" style={tint}>
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
      {found && found.length > 0 && (
        <span className="tile done-tile done-found" style={tint}>
          {found.slice(0, 4).map((picture, i) => (
            <span key={picture.src} className="done-found-thing" style={{ "--k": i } as CSSProperties}>
              <Image src={picture} alt="" fill sizes="3rem" className="object-contain" />
            </span>
          ))}
        </span>
      )}
    </div>
  );
}
