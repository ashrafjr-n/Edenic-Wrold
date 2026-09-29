"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
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
  /** Arriving from the done screen of this lesson (1-based, `?from=`):
      walk on to the next stop, then open it. */
  advanceFrom?: number;
}

/* The path's geometry, in px down and % across. A stop's centre sits on a
   sine: middle, right, middle, left… so the path winds instead of stacking. */
const ROW = 166;
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

/* The walk from a finished stop to the next one, in ms from arrival: the
   finished stop takes its tick and the track draws on while Pinki hops
   across, then the next stop's padlock springs off, then its lesson opens. */
const WALK_AT = 1300;
const OPEN_AT = 2400;
const GO_AT = 3800;

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
export function LessonPath({ titles, covers, characterId, lessonId, basePath, tone, dict, advanceFrom }: LessonPathProps) {
  const router = useRouter();
  const stars = useCourseStars(characterId, lessonId, titles.length);
  const hydrated = useProgress((state) => state.hydrated);
  const count = titles.length;
  const nextIndex = stars.findIndex((s) => s === 0);
  const allDone = nextIndex === -1;

  /* Latched once, and only if the child has not yet SEEN the stop after
     `from` open: a Back from the next lesson remounts this page with the same
     cached `?from=`, and must land on a still path, not walk them on again. */
  const [walkFrom] = useState(() => {
    if (advanceFrom === undefined || typeof window === "undefined") return advanceFrom;
    const seen = readSeen()[`${characterId}.${lessonId}`];
    return seen === undefined || seen < advanceFrom ? advanceFrom : undefined;
  });
  const [phase, setPhase] = useState<"at" | "walk" | "open">("at");
  /* Only when progress agrees: the lesson just finished is the one right
     before the next open stop. */
  const advancing = hydrated && walkFrom !== undefined && walkFrom === nextIndex;
  const walked = advancing ? phase : "open";
  const from = nextIndex - 1;
  /* The stop that wears the "next" colour: the finished one before the
     walk, none during it, the new one once its padlock has sprung. */
  const current = walked === "at" ? from : walked === "walk" ? -1 : nextIndex;

  /* How far the lit track reaches: to the next stop, or the whole way. */
  const reach = allDone ? count - 1 : advancing ? from : nextIndex;
  const pinkiAt = allDone ? count - 1 : walked === "at" ? from : nextIndex;

  const nextRef = useRef<HTMLAnchorElement>(null);
  const [unlocking, setUnlocking] = useState(-1);

  useEffect(() => {
    if (!advancing) return;
    window.history.replaceState(null, "", basePath);
    const timers = [
      setTimeout(() => setPhase("walk"), WALK_AT),
      setTimeout(() => {
        setPhase("open");
        setUnlocking(nextIndex);
      }, OPEN_AT),
      setTimeout(() => router.push(`${basePath}/${nextIndex + 1}`), GO_AT),
    ];
    return () => timers.forEach(clearTimeout);
  }, [advancing, basePath, nextIndex, router]);

  /* Once progress is known: bring the next stop into view, and spring its
     lock if it opened since the last visit (the walk springs its own). */
  useEffect(() => {
    if (!hydrated || allDone) return;
    const seen = readSeen();
    const key = `${characterId}.${lessonId}`;
    const timer = setTimeout(() => {
      if (!advancing && seen[key] !== undefined && seen[key] < nextIndex) setUnlocking(nextIndex);
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
  }, [hydrated, allDone, advancing, nextIndex, characterId, lessonId]);

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
          {walked !== "at" && advancing && (
            <g className="path-draw">
              <path d={trackPath(from, nextIndex)} transform="translate(0 4)" stroke={tone.edge} strokeWidth={18} vectorEffect="non-scaling-stroke" />
              <path d={trackPath(from, nextIndex)} stroke={tone.face} strokeWidth={18} vectorEffect="non-scaling-stroke" />
              <path d={trackPath(from, nextIndex)} transform="translate(0 -3)" stroke="rgb(255 255 255 / 40%)" strokeWidth={5} vectorEffect="non-scaling-stroke" />
            </g>
          )}
          <path d={trackPath(0, count - 1)} stroke="rgb(255 255 255 / 75%)" strokeWidth={5} strokeDasharray="0 17" vectorEffect="non-scaling-stroke" />
        </g>
      </svg>

      {titles.map((title, i) => {
        const n = i + 1;
        const done = stars[i] > 0 && !(walked === "at" && i === from);
        const isNext = i === current;
        const locked = !done && !isNext;
        const size = isNext ? NEXT_DISC : DISC;
        const cover = covers[i] ?? [];
        const springing = i === unlocking;
        /* On a return visit the lock waits for the page to settle; on the
           walk it springs the moment Pinki arrives. */
        const springDelay = advancing ? 0.05 : 0.9;

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
            } path-disc ${springing ? "anim-jump" : ""}`}
            style={
              {
                width: size,
                height: size,
                ...(isNext ? { backgroundColor: tone.face, "--clay-edge": tone.edge, "--path-ring": tone.face } : {}),
                ...(springing ? { animationDelay: `${springDelay + 0.2}s` } : {}),
                "--art-shadow": isNext ? tone.edge : "rgb(var(--shadow-hue))",
              } as Vars
            }
          >
            <span className={`flex h-full w-full items-center justify-center ${locked ? "path-art-locked" : ""}`}>
              {art}
            </span>
            {done && (
              <span
                className={`clay absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full ${
                  advancing && i === from ? "anim-pop-in" : ""
                }`}
                style={{ backgroundColor: "var(--color-go)", "--clay-edge": "var(--color-go-dark)" } as Vars}
              >
                <Check className="h-4 w-4 text-white" strokeWidth={3.25} />
              </span>
            )}
            {(locked || springing) && (
              <span
                className={`lock-chip absolute -bottom-1 -right-1 h-8 w-8 ${springing ? "path-lock-off" : ""}`}
                style={springing ? { animationDelay: `${springDelay}s` } : undefined}
              >
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
            {isNext && walked === "open" && (
              <span
                className="path-bubble card card-clay-white card-pill anim-breathe absolute bottom-full left-1/2 mb-3 whitespace-nowrap px-4 py-1.5 text-sm font-bold uppercase tracking-wide"
                style={{ color: tone.edge, translate: "-50% 0" }}
              >
                {dict.ctaStart}
              </span>
            )}
            {disc}
            <span
              className={`card card-pill absolute left-1/2 top-full mt-2.5 -translate-x-1/2 whitespace-nowrap px-3 py-1 text-[0.8125rem] font-bold leading-tight ${
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
        className={`path-pinki pointer-events-none absolute w-20 ${walked === "walk" ? "path-hop" : "anim-pop-in"}`}
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
