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
  /** `phone` and `tablet` wind DOWN the page; `wide` winds ACROSS a box
      whose height the parent sets (desktop). */
  size?: PathSize;
}

type PathSize = "phone" | "tablet" | "wide";

/* A stop's centre sits on a sine: middle, one side, middle, the other side…
   so the path winds instead of stacking. Down the page it is px down and %
   across; across a box (`wide`) it is % both ways. */
const DOWN = {
  phone: { row: 166, top: 62, disc: 88, next: 108, bottom: 56, swing: 24 },
  tablet: { row: 210, top: 84, disc: 128, next: 156, bottom: 76, swing: 26 },
} as const;

/* Across a box, stops size to the box (`cqi`/`cqb`), so a 1024px laptop and
   a 1920px screen both get stops that fit between their neighbours. */
const WIDE = { disc: "min(9.5rem, 15cqi, 26cqb)", next: "min(12rem, 19cqi, 32cqb)", art: 190 } as const;

/* Chrome around a stop, per size. The phone's strings are the original ones. */
const CHROME = {
  phone: {
    box: "relative mx-auto w-full max-w-sm",
    badge: "h-8 w-8",
    tick: "h-4 w-4",
    lock: "h-3.5 w-3.5",
    bubble: "mb-3 px-4 py-1.5 text-sm",
    label: "mt-2.5 px-3 py-1 text-[0.8125rem]",
  },
  tablet: {
    box: "relative mx-auto w-full max-w-xl",
    badge: "h-10 w-10",
    tick: "h-5 w-5",
    lock: "h-4 w-4",
    bubble: "mb-4 px-5 py-2 text-base",
    label: "mt-3 px-4 py-1.5 text-base",
  },
  wide: {
    box: "relative h-full w-full [container-type:size]",
    badge: "h-10 w-10",
    tick: "h-5 w-5",
    lock: "h-4 w-4",
    bubble: "mb-4 px-5 py-2 text-base",
    label: "mt-3 px-4 py-1.5 text-base",
  },
} as const;

const wave = (i: number) => Math.round(Math.sin((i * Math.PI) / 2));

function geometry(size: PathSize, count: number) {
  if (size === "wide") {
    const step = count > 1 ? 80 / (count - 1) : 0;
    const xAt = (i: number) => 10 + i * step;
    const yAt = (i: number) => 50 - 26 * wave(i);
    return {
      xAt,
      yAt,
      top: (i: number) => `${yAt(i)}%`,
      height: 100,
      disc: WIDE.disc,
      next: WIDE.next,
      art: WIDE.art,
      /** One S-curve through every stop from `from` to `to`, across. */
      track(from: number, to: number) {
        let d = `M ${xAt(from)} ${yAt(from)}`;
        for (let i = from; i < to; i++) {
          const bend = step * 0.55;
          d += ` C ${xAt(i) + bend} ${yAt(i)} ${xAt(i + 1) - bend} ${yAt(i + 1)} ${xAt(i + 1)} ${yAt(i + 1)}`;
        }
        return d;
      },
    };
  }
  const g = DOWN[size];
  const xAt = (i: number) => 50 + g.swing * wave(i);
  const yAt = (i: number) => g.top + g.next / 2 + i * g.row;
  return {
    xAt,
    yAt,
    top: yAt,
    height: yAt(count - 1) + g.next / 2 + g.bottom,
    disc: g.disc,
    next: g.next,
    art: g.next,
    /** One S-curve through every stop from `from` to `to`, down (x 0–100,
        y in px). */
    track(from: number, to: number) {
      let d = `M ${xAt(from)} ${yAt(from)}`;
      for (let i = from; i < to; i++) {
        const bend = g.row * 0.55;
        d += ` C ${xAt(i)} ${yAt(i) + bend} ${xAt(i + 1)} ${yAt(i + 1) - bend} ${xAt(i + 1)} ${yAt(i + 1)}`;
      }
      return d;
    },
  };
}

/* The walk from a finished stop to the next one, in ms from arrival: the
   finished stop takes its tick and the track draws on to the next stop,
   then the next stop's padlock springs off, then its lesson opens. */
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
 * A course's lessons as a winding clay path — down the page on a phone and
 * a tablet, across a board on a desktop. Every stop is a clay
 * disc wearing its lesson's thing: finished ones are white with a green
 * tick, the next one is the course colour, bigger, with a "Start" bubble;
 * locked ones are pale with a padlock. The track is
 * lit in the course colour up to the next stop.
 */
export function LessonPath({
  titles,
  covers,
  characterId,
  lessonId,
  basePath,
  tone,
  dict,
  advanceFrom,
  size = "phone",
}: LessonPathProps) {
  const router = useRouter();
  const geo = geometry(size, titles.length);
  const chrome = CHROME[size];
  /* A page renders one path per screen size and hides the others; only the
     one on screen may walk, remember what was seen, or scroll. */
  const rootRef = useRef<HTMLDivElement>(null);
  const onScreen = () => rootRef.current?.offsetParent != null;
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

  const nextRef = useRef<HTMLAnchorElement>(null);
  const [unlocking, setUnlocking] = useState(-1);

  useEffect(() => {
    if (!advancing || !onScreen()) return;
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
    if (!hydrated || allDone || !onScreen()) return;
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
      if (size !== "wide" && el && el.getBoundingClientRect().bottom > window.innerHeight - 160) {
        el.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [hydrated, allDone, advancing, nextIndex, characterId, lessonId, size]);

  const { height, xAt } = geo;
  const trackPath = geo.track;

  return (
    <div ref={rootRef} className={chrome.box} style={size === "wide" ? undefined : { height }}>
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
            <g className={size === "wide" ? "path-draw path-draw--x" : "path-draw"}>
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
        const disc = isNext ? geo.next : geo.disc;
        const cover = covers[i] ?? [];
        const springing = i === unlocking;
        /* On a return visit the lock waits for the page to settle; on the
           walk it springs as soon as the track arrives. */
        const springDelay = advancing ? 0.05 : 0.9;

        const art =
          cover.length > 1 ? (
            <CourseArt images={cover} width={geo.art} className="h-[78%] w-[78%]" />
          ) : cover[0] ? (
            <Image src={cover[0]} alt="" sizes={`${Math.round(geo.art * 0.62)}px`} className="h-auto w-[62%]" />
          ) : null;

        const discEl = (
          <span
            className={`relative flex items-center justify-center ${
              isNext ? "clay path-next rounded-full" : "card card-clay-white card-pill"
            } path-disc ${springing ? "anim-jump" : ""}`}
            style={
              {
                width: disc,
                height: disc,
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
                className={`clay absolute -right-1 -top-1 flex ${chrome.badge} items-center justify-center rounded-full ${
                  advancing && i === from ? "anim-pop-in" : ""
                }`}
                style={{ backgroundColor: "var(--color-go)", "--clay-edge": "var(--color-go-dark)" } as Vars}
              >
                <Check className={`${chrome.tick} text-white`} strokeWidth={3.25} />
              </span>
            )}
            {(locked || springing) && (
              <span
                className={`lock-chip absolute -bottom-1 -right-1 ${chrome.badge} ${springing ? "path-lock-off" : ""}`}
                style={springing ? { animationDelay: `${springDelay}s` } : undefined}
              >
                <Lock className={chrome.lock} strokeWidth={2.75} />
              </span>
            )}
          </span>
        );

        const stopStyle: CSSProperties = {
          left: `${xAt(i)}%`,
          top: geo.top(i),
          animationDelay: `${0.15 + i * 0.08}s`,
        };

        const body = (
          <>
            {isNext && walked === "open" && (
              <span
                className={`path-bubble card card-clay-white card-pill anim-breathe absolute bottom-full left-1/2 ${chrome.bubble} whitespace-nowrap font-bold uppercase tracking-wide`}
                style={{ color: tone.edge, translate: "-50% 0" }}
              >
                {dict.ctaStart}
              </span>
            )}
            {discEl}
            <span
              className={`card card-pill absolute left-1/2 top-full ${chrome.label} -translate-x-1/2 whitespace-nowrap font-bold leading-tight ${
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

    </div>
  );
}
