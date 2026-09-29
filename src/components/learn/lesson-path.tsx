"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { Check, Lock } from "lucide-react";
import { useCourseStars, useProgress } from "@/store/progress";
import { format } from "@/lib/format-dict";
import { CourseArt } from "@/components/learn/course-art";
import type { Dictionary } from "@/lib/dictionaries/en";
import pinkiWave from "../../../public/assets/friends/pinki.png";
import pinkiCheer from "../../../public/assets/learn-with-pinki/pinki/pinki-celebrate.png";

interface LessonPathProps {
  /** One title per lesson, in order, already in the active locale. */
  titles: readonly string[];
  /** Each lesson's cover (`LessonDef.cover`), in the same order. */
  covers: readonly (readonly StaticImageData[])[];
  characterId: string;
  lessonId: string;
  /** `/learn/pinki/shapes` — each stop appends its own lesson number. */
  basePath: string;
  /** The course's own colour pair. */
  tone: { face: string; edge: string };
  dict: Dictionary["lessonPicker"];
}

/* The path's geometry, in px down and % across. A stop's centre sits on a
   sine: middle, right, middle, left… so the path winds instead of stacking. */
const ROW = 150;
const TOP = 62;
const DISC = 88;
const NEXT_DISC = 108;
const BOTTOM = 56;
const SWING = 24;

const xAt = (i: number) => 50 + SWING * Math.round(Math.sin((i * Math.PI) / 2));
const yAt = (i: number) => TOP + NEXT_DISC / 2 + i * ROW;

/** One S-curve through every stop from `from` to `to`, in the SVG's own
    units (x 0–100, y in px). */
function trackPath(from: number, to: number) {
  let d = `M ${xAt(from)} ${yAt(from)}`;
  for (let i = from; i < to; i++) {
    const bend = ROW * 0.55;
    d += ` C ${xAt(i)} ${yAt(i) + bend} ${xAt(i + 1)} ${yAt(i + 1) - bend} ${xAt(i + 1)} ${yAt(i + 1)}`;
  }
  return d;
}

/* Remembers, per course, the furthest stop the child has SEEN open — so a
   stop opened since the last visit can spring its lock off once. */
const SEEN_KEY = "edenic-path-seen";

function readSeen(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) ?? "{}");
  } catch {
    return {};
  }
}

type Vars = CSSProperties & Record<`--${string}`, string>;

/**
 * A course's lessons as a winding clay path (phone). Every stop is a clay
 * disc wearing its lesson's thing: finished ones are white with a green
 * tick, the next one is the course colour, bigger, with a "Start" bubble
 * and Pinki beside it; locked ones are pale with a padlock. The track is
 * lit in the course colour up to the next stop.
 */
export function LessonPath({ titles, covers, characterId, lessonId, basePath, tone, dict }: LessonPathProps) {
  const stars = useCourseStars(characterId, lessonId, titles.length);
  const count = titles.length;
  const nextIndex = stars.findIndex((s) => s === 0);
  const allDone = nextIndex === -1;
  /* How far the lit track reaches: to the next stop, or the whole way. */
  const reach = allDone ? count - 1 : nextIndex;
  const pinkiAt = allDone ? count - 1 : nextIndex;

  const nextRef = useRef<HTMLAnchorElement>(null);
  const [unlocking, setUnlocking] = useState(-1);

  /* Once progress is known: bring the next stop into view, and spring its
     lock if it opened since the last visit. */
  const hydrated = useProgress((state) => state.hydrated);
  useEffect(() => {
    if (!hydrated || allDone) return;
    const seen = readSeen();
    const key = `${characterId}.${lessonId}`;
    const timer = setTimeout(() => {
      if (seen[key] !== undefined && seen[key] < nextIndex) setUnlocking(nextIndex);
      try {
        localStorage.setItem(SEEN_KEY, JSON.stringify({ ...seen, [key]: nextIndex }));
      } catch {
        /* Storage off: the lock just doesn't spring. Nothing is lost. */
      }
      const el = nextRef.current;
      if (el && el.getBoundingClientRect().bottom > window.innerHeight - 160) {
        el.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [hydrated, allDone, nextIndex, characterId, lessonId]);

  const height = yAt(count - 1) + NEXT_DISC / 2 + BOTTOM;
  const pinkiLeft = xAt(pinkiAt) > 50;

  return (
    <div className="relative mx-auto w-full max-w-sm" style={{ height }}>
      <svg
        className="absolute inset-0 h-full w-full overflow-visible"
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
        aria-hidden
      >
        <g fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke">
          <path d={trackPath(0, count - 1)} transform="translate(0 4)" stroke="var(--color-locked-dark)" strokeWidth={18} vectorEffect="non-scaling-stroke" />
          <path d={trackPath(0, count - 1)} stroke="var(--color-locked)" strokeWidth={18} vectorEffect="non-scaling-stroke" />
          {reach > 0 && (
            <g className="anim-fade-up" style={{ animationDelay: "0.3s" }}>
              <path d={trackPath(0, reach)} transform="translate(0 4)" stroke={tone.edge} strokeWidth={18} vectorEffect="non-scaling-stroke" />
              <path d={trackPath(0, reach)} stroke={tone.face} strokeWidth={18} vectorEffect="non-scaling-stroke" />
              <path d={trackPath(0, reach)} transform="translate(0 -3)" stroke="rgb(255 255 255 / 40%)" strokeWidth={5} vectorEffect="non-scaling-stroke" />
            </g>
          )}
          <path d={trackPath(0, count - 1)} stroke="rgb(255 255 255 / 75%)" strokeWidth={5} strokeDasharray="0 17" vectorEffect="non-scaling-stroke" />
        </g>
      </svg>

      {titles.map((title, i) => {
        const n = i + 1;
        const done = stars[i] > 0;
        const isNext = i === nextIndex;
        const locked = !done && !isNext;
        const size = isNext ? NEXT_DISC : DISC;
        const cover = covers[i] ?? [];
        const springing = i === unlocking;

        const art =
          cover.length > 1 ? (
            <CourseArt images={cover} width={size} className="h-[78%] w-[78%]" />
          ) : cover[0] ? (
            <Image src={cover[0]} alt="" sizes={`${Math.round(size * 0.62)}px`} className="h-auto w-[62%]" />
          ) : null;

        const disc = (
          <span
            className={`relative flex items-center justify-center ${
              isNext ? "clay path-next rounded-full" : "card card-clay-white card-pill"
            } ${springing ? "anim-jump" : ""}`}
            style={
              {
                width: size,
                height: size,
                ...(isNext ? { backgroundColor: tone.face, "--clay-edge": tone.edge, "--path-ring": tone.face } : {}),
                ...(springing ? { animationDelay: "1.1s" } : {}),
                "--art-shadow": isNext ? tone.edge : "rgb(var(--shadow-hue))",
              } as Vars
            }
          >
            <span className={`flex h-full w-full items-center justify-center ${locked ? "path-art-locked" : ""}`}>
              {art}
            </span>
            {done && (
              <span
                className="clay absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full"
                style={{ backgroundColor: "var(--color-go)", "--clay-edge": "var(--color-go-dark)" } as Vars}
              >
                <Check className="h-4 w-4 text-white" strokeWidth={3.25} />
              </span>
            )}
            {(locked || springing) && (
              <span className={`lock-chip absolute -bottom-1 -right-1 h-8 w-8 ${springing ? "path-lock-off" : ""}`}>
                <Lock className="h-3.5 w-3.5" strokeWidth={2.75} />
              </span>
            )}
          </span>
        );

        const stopStyle: CSSProperties = {
          left: `${xAt(i)}%`,
          top: yAt(i),
          animationDelay: `${0.15 + i * 0.08}s`,
        };

        const body = (
          <>
            {isNext && (
              <span
                className="path-bubble card card-clay-white card-pill anim-breathe absolute bottom-full left-1/2 mb-3 whitespace-nowrap px-4 py-1.5 text-sm font-bold uppercase tracking-wide"
                style={{ color: tone.edge, translate: "-50% 0" }}
              >
                {dict.ctaStart}
              </span>
            )}
            {disc}
            <span
              className={`absolute left-1/2 top-full mt-2 w-32 -translate-x-1/2 text-center text-sm font-bold leading-tight ${
                locked ? "text-[var(--color-ink-soft)]" : "text-[var(--color-ink)]"
              }`}
            >
              {title}
            </span>
          </>
        );

        const stopClass = "anim-rise-in absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center";

        return locked ? (
          <span
            key={n}
            className={stopClass}
            style={stopStyle}
            aria-label={format(dict.lockedLessonAria, { n, title })}
          >
            {body}
          </span>
        ) : (
          <Link
            key={n}
            ref={isNext ? nextRef : undefined}
            href={`${basePath}/${n}`}
            className={`${stopClass} path-stop`}
            style={stopStyle}
            aria-label={format(dict.startLessonAria, { n, title })}
          >
            {body}
          </Link>
        );
      })}

      <Image
        src={allDone ? pinkiCheer : pinkiWave}
        alt=""
        sizes="80px"
        className="anim-pop-in pointer-events-none absolute w-20"
        style={{
          left: `${pinkiLeft ? xAt(pinkiAt) - 38 : xAt(pinkiAt) + 38}%`,
          top: yAt(pinkiAt) - 28,
          translate: "-50% -50%",
          animationDelay: "0.7s",
        }}
      />
    </div>
  );
}
