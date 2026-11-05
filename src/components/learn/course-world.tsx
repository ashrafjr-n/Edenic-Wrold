"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, ChevronsDown, Lock, Play } from "lucide-react";
import { useCourseUnlock } from "@/components/learn/use-course-unlock";
import { format } from "@/lib/format-dict";
import { useWide } from "@/lib/use-wide";
import { useProgress } from "@/store/progress";
import type { Dictionary } from "@/lib/dictionaries/en";
import type { BoxStop } from "@/data/courses";
import type { CourseStops, CourseStopsFrame, SceneRect } from "@/types/course";
import { place } from "./lesson/find-shapes";
import { worldCover } from "./lesson/lesson-world";

/** How far the camera catches up with the scroll each frame (0..1): the
    glide that makes it a camera rather than a scrubber. */
const GLIDE = 0.16;
/** Pictures loading at once. */
const LOADING_AT_ONCE = 4;
/** A stop this small (% of the frame's width) is still far off: no words. */
const FAR_WIDE = 8.5;
const FAR_TALL = 13;
/** Wider than this (% of the frame) it is passing the camera, or behind it. */
const PAST = 75;

/** Each stop's box at `progress`, between the render's key positions. */
function boxAt(keys: readonly (readonly SceneRect[])[], progress: number, stop: number): SceneRect {
  const at = progress * (keys.length - 1);
  const low = Math.min(keys.length - 2, Math.floor(at));
  const mix = at - low;
  const [a, b] = [keys[low][stop], keys[low + 1][stop]];
  return [0, 1, 2, 3].map((i) => a[i] + (b[i] - a[i]) * mix) as unknown as SceneRect;
}

const frameUrl = (data: CourseStopsFrame, f: number) => `${data.path}f${String(f).padStart(3, "0")}.jpg?v=${data.version}`;

interface CourseWorldProps {
  world: CourseStops;
  /** One title per lesson, localized. */
  titles: readonly string[];
  stops: readonly BoxStop[];
  characterId: string;
  lessonId: string;
  basePath: string;
  dict: Dictionary["lessonPicker"];
  dir: "rtl" | "ltr";
}

/**
 * A course as a 3D world of stops (2026-11-05, Shapes first, the user's
 * picture): its lessons on clay pedestals with stepping stones between
 * them, the review a treasure chest on the last. Pre-rendered, never live 3D
 * on a phone. **The scroll is the camera** (the user, same day): the page
 * has height, but nothing slides — the frames of the camera's way in, going
 * up a little and further in, are painted on a canvas as it moves. Each stop
 * is a real link laid over its pedestal, carried along by the render's own
 * numbers. It opens where the child carries on.
 */
export function CourseWorld({ world, titles, stops, characterId, lessonId, basePath, dict, dir }: CourseWorldProps) {
  const wide = useWide();
  const data = world[wide ? "landscape" : "portrait"];
  const rootRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLAnchorElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const stopRefs = useRef<(HTMLElement | null)[]>([]);
  const { stars, nextIndex } = useCourseUnlock({ characterId, lessonId, count: titles.length, rootRef, nextRef, scroll: false });
  const hydrated = useProgress((state) => state.hydrated);
  const opened = useRef(false);

  const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;

  /* The camera: load the frames, follow the scroll with a glide, paint the
     nearest frame loaded, carry the links along. */
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const pictures: (HTMLImageElement | null)[] = Array.from({ length: world.frames }, () => null);
    let cancelled = false;
    let raf = 0;
    let current = -1;
    let painted = -1;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const far = wide ? FAR_WIDE : FAR_TALL;

    const paint = (progress: number) => {
      const wanted = Math.round(progress * (world.frames - 1));
      let found = -1;
      for (let d = 0; d < world.frames && found < 0; d++) {
        if (pictures[wanted - d]) found = wanted - d;
        else if (pictures[wanted + d]) found = wanted + d;
      }
      if (found >= 0 && found !== painted) {
        const picture = pictures[found]!;
        if (canvas.width !== picture.naturalWidth) {
          canvas.width = picture.naturalWidth;
          canvas.height = picture.naturalHeight;
        }
        context.drawImage(picture, 0, 0);
        painted = found;
      }
      stopRefs.current.forEach((element, i) => {
        if (!element) return;
        const box = boxAt(data.keys, progress, i);
        Object.assign(element.style, place(box));
        element.toggleAttribute("data-far", box[2] < far);
        /* The camera has gone past it. */
        element.style.visibility = box[2] > PAST || box[1] > 100 ? "hidden" : "";
      });
      hintRef.current?.toggleAttribute("data-gone", progress > 0.03);
    };

    const tick = () => {
      raf = 0;
      const top = maxScroll();
      const target = top > 0 ? Math.min(1, Math.max(0, window.scrollY / top)) : 0;
      current = current < 0 || still ? target : current + (target - current) * GLIDE;
      if (Math.abs(target - current) < 0.0004) current = target;
      paint(current);
      if (current !== target) raf = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    let nextToLoad = 0;
    const loadNext = () => {
      if (cancelled || nextToLoad >= world.frames) return;
      const f = nextToLoad++;
      const picture = new window.Image();
      picture.onload = () => {
        pictures[f] = picture;
        painted = -1;
        wake();
        loadNext();
      };
      picture.onerror = loadNext;
      picture.src = frameUrl(data, f);
    };
    for (let i = 0; i < LOADING_AT_ONCE; i++) loadNext();

    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("resize", wake);
    wake();
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", wake);
      window.removeEventListener("resize", wake);
    };
  }, [data, world.frames, wide]);

  /* Once progress is known: open at the stop the child carries on from. */
  useEffect(() => {
    if (!hydrated || opened.current) return;
    opened.current = true;
    if (nextIndex > 0) window.scrollTo(0, data.focus[nextIndex] * maxScroll());
  }, [hydrated, nextIndex, data]);

  return (
    <div ref={rootRef}>
      {/* The height the scroll runs through; nothing is laid on it. */}
      <div className="course-world-run" />

      <div className="world-frame -z-[5]" aria-hidden>
        <div className="world-cover" style={worldCover(wide)}>
          <Image src={data.first} alt="" fill preload sizes="100vw" className="object-cover" />
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
        </div>
      </div>

      <div className="world-frame course-world-stops z-10">
        <div className="world-cover" style={worldCover(wide)}>
          {titles.map((title, i) => {
            const done = hydrated && stars[i] > 0;
            const isNext = hydrated && i === nextIndex;
            const locked = !done && !isNext;
            const stop = stops[i];
            const review = stop.review === true;
            const word = review || stop.word === undefined ? title : stop.word;
            const n = i + 1;
            const box = data.keys[0][i];
            const ref = (element: HTMLElement | null) => {
              stopRefs.current[i] = element;
            };
            if (locked) {
              return (
                <span
                  key={title}
                  ref={ref}
                  role="img"
                  aria-label={format(dict.lockedLessonAria, { n, title })}
                  className="course-stop course-stop--locked"
                  style={place(box)}
                >
                  <span className="course-stop-haze" />
                  <span className="course-stop-mark">
                    <Lock strokeWidth={2.75} />
                  </span>
                </span>
              );
            }
            return (
              <Link
                key={title}
                ref={(element) => {
                  ref(element);
                  if (isNext) nextRef.current = element;
                }}
                href={`${basePath}/${n}`}
                aria-label={format(dict.startLessonAria, { n, title })}
                onFocus={() => window.scrollTo(0, data.focus[i] * maxScroll())}
                className={`course-stop ${isNext ? "course-stop--next" : "course-stop--done"}`}
                style={place(box)}
              >
                {done && (
                  <span className="course-stop-mark course-stop-mark--done">
                    <Check strokeWidth={3.5} />
                  </span>
                )}
                {isNext && (
                  <span className="course-stop-go" style={{ "--go": "var(--page-accent-color)" } as CSSProperties}>
                    <Play className="fill-current" strokeWidth={2.5} />
                    <span dir={dir}>{dict.ctaStart}</span>
                  </span>
                )}
                <span dir={dir} className="course-stop-tag">
                  {word}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <div ref={hintRef} className="course-world-hint" aria-hidden>
        <ChevronsDown strokeWidth={3} />
      </div>
    </div>
  );
}
