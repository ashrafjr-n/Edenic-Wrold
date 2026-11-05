"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { Lock, Play } from "lucide-react";
import { useCourseUnlock } from "@/components/learn/use-course-unlock";
import { format } from "@/lib/format-dict";
import { useWide } from "@/lib/use-wide";
import { useProgress } from "@/store/progress";
import type { Dictionary } from "@/lib/dictionaries/en";
import type { CourseStops, CourseStopsFrame, SceneRect } from "@/types/course";
import { place } from "./lesson/find-shapes";
import { worldCover } from "./lesson/lesson-world";

/** How far the camera catches up with the scroll each frame (0..1): the
    glide that makes it a camera rather than a scrubber. */
const GLIDE = 0.16;
/** Pictures loading at once. */
const LOADING_AT_ONCE = 4;
/** Wider than this (% of the frame) it is passing the camera, or behind it. */
const PAST = 75;
/** What a done way's white stones are multiplied by: Pinki's pink. */
const WAY_PINK = "#ff86b4";
/** A way turning pink, stone by stone, from the lesson just done. */
const TURN_MS = 1500;
/** Before it starts; then the camera goes on to the next lesson. */
const TURN_DELAY_MS = 500;
/** The ways between the lessons (five stops, four ways). */
const WAYS = 4;

/** Each stop's box at `progress`, between the render's key positions. */
function boxAt(keys: readonly (readonly SceneRect[])[], progress: number, stop: number): SceneRect {
  const at = progress * (keys.length - 1);
  const low = Math.min(keys.length - 2, Math.floor(at));
  const mix = at - low;
  const [a, b] = [keys[low][stop], keys[low + 1][stop]];
  return [0, 1, 2, 3].map((i) => a[i] + (b[i] - a[i]) * mix) as unknown as SceneRect;
}

const fileUrl = (data: CourseStopsFrame, name: string, f: number, type: string) => `${data.path}${name}${String(f).padStart(3, "0")}.${type}?v=${data.version}`;

interface CourseWorldProps {
  world: CourseStops;
  /** One title per lesson, localized. */
  titles: readonly string[];
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
 * numbers. It opens where the child carries on; the first lesson is the
 * farthest, the chest the nearest.
 *
 * The stepping stones are white until the lesson before them is done, then
 * pink: each frame comes with a mask of each way's stones, and the page
 * multiplies pink through it, so they keep their shading. Coming back from a
 * lesson just done, its way turns pink stone by stone, and the camera goes on
 * to the next lesson.
 */
export function CourseWorld({ world, titles, characterId, lessonId, basePath, dict, dir }: CourseWorldProps) {
  const wide = useWide();
  const data = world[wide ? "landscape" : "portrait"];
  const rootRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLAnchorElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stopRefs = useRef<(HTMLElement | null)[]>([]);
  const { stars, nextIndex, unlocking } = useCourseUnlock({ characterId, lessonId, count: titles.length, rootRef, nextRef, scroll: false });
  const hydrated = useProgress((state) => state.hydrated);
  const opened = useRef(false);
  /* The ways pink by now, and the one turning: [its index, how far 0..1]. */
  const donePink = useRef(0);
  const turning = useRef<[number, number] | null>(null);
  const redraw = useRef<() => void>(() => undefined);

  /* A way is pink once the lesson before it is done. */
  const pinkWays = !hydrated ? 0 : nextIndex < 0 ? WAYS : nextIndex;
  useEffect(() => {
    donePink.current = pinkWays;
    redraw.current();
  }, [pinkWays]);

  const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;

  /* The camera: load the frames, follow the scroll with a glide, paint the
     nearest frame loaded, carry the links along. */
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const pictures: (HTMLImageElement | null)[] = Array.from({ length: world.frames }, () => null);
    const masks: (HTMLImageElement | null)[] = Array.from({ length: world.frames }, () => null);
    const layer = document.createElement("canvas");
    const layerContext = layer.getContext("2d");
    let cancelled = false;
    let raf = 0;
    let current = -1;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const paint = (progress: number) => {
      const wanted = Math.round(progress * (world.frames - 1));
      let found = -1;
      for (let d = 0; d < world.frames && found < 0; d++) {
        if (pictures[wanted - d]) found = wanted - d;
        else if (pictures[wanted + d]) found = wanted + d;
      }
      if (found >= 0) {
        const picture = pictures[found]!;
        if (canvas.width !== picture.naturalWidth) {
          canvas.width = layer.width = picture.naturalWidth;
          canvas.height = layer.height = picture.naturalHeight;
        }
        context.drawImage(picture, 0, 0);
        const mask = masks[found];
        if (mask && layerContext) {
          /* The ways turned pink: white stones multiplied by pink keep their
             light and shade. A way turning grows out from its lesson. */
          const turn = turning.current;
          const tile = mask.naturalHeight / WAYS;
          for (let way = 0; way < WAYS; way++) {
            const whole = way < donePink.current && turn?.[0] !== way;
            if (!whole && turn?.[0] !== way) continue;
            layerContext.globalCompositeOperation = "source-over";
            layerContext.clearRect(0, 0, layer.width, layer.height);
            layerContext.drawImage(mask, 0, tile * way, mask.naturalWidth, tile, 0, 0, layer.width, layer.height);
            layerContext.globalCompositeOperation = "source-in";
            layerContext.fillStyle = WAY_PINK;
            layerContext.fillRect(0, 0, layer.width, layer.height);
            if (!whole && turn) {
              const [ax, ay, aw, ah] = boxAt(data.keys, progress, way);
              const [bx, by, bw, bh] = boxAt(data.keys, progress, way + 1);
              const [cx, cy] = [((ax + aw / 2) * layer.width) / 100, ((ay + ah) * layer.height) / 100];
              const [dx, dy] = [((bx + bw / 2) * layer.width) / 100, ((by + bh) * layer.height) / 100];
              const reach = Math.hypot(dx - cx, dy - cy) * 1.15 * turn[1];
              layerContext.globalCompositeOperation = "destination-in";
              layerContext.beginPath();
              layerContext.arc(cx, cy, Math.max(0.5, reach), 0, Math.PI * 2);
              layerContext.fillStyle = "#000";
              layerContext.fill();
            }
            context.globalCompositeOperation = "multiply";
            context.drawImage(layer, 0, 0);
            context.globalCompositeOperation = "source-over";
          }
        }
      }
      stopRefs.current.forEach((element, i) => {
        if (!element) return;
        const box = boxAt(data.keys, progress, i);
        Object.assign(element.style, place(box));
        /* The camera has gone past it. */
        element.style.visibility = box[2] > PAST || box[1] > 100 ? "hidden" : "";
      });
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
        wake();
        loadNext();
      };
      picture.onerror = loadNext;
      picture.src = fileUrl(data, "f", f, "jpg");
      const mask = new window.Image();
      mask.onload = () => {
        masks[f] = mask;
        wake();
      };
      mask.src = fileUrl(data, "w", f, "png");
    };
    for (let i = 0; i < LOADING_AT_ONCE; i++) loadNext();

    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("resize", wake);
    wake();
    redraw.current = () => paint(Math.max(0, current));
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
    window.scrollTo(0, data.focus[nextIndex < 0 ? data.focus.length - 1 : nextIndex] * maxScroll());
  }, [hydrated, nextIndex, data]);

  /* Back from a lesson just done: stand at it, turn its way pink stone by
     stone, then the camera goes on to the next one. */
  useEffect(() => {
    if (unlocking < 1) return;
    const way = unlocking - 1;
    window.scrollTo(0, data.focus[way] * maxScroll());
    turning.current = [way, 0];
    redraw.current();
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const started = performance.now() + TURN_DELAY_MS;
    let raf = 0;
    const step = (now: number) => {
      const p = still ? 1 : Math.min(1, Math.max(0, (now - started) / TURN_MS));
      turning.current = [way, p];
      redraw.current();
      if (p < 1) {
        raf = requestAnimationFrame(step);
        return;
      }
      turning.current = null;
      window.scrollTo({ top: data.focus[unlocking] * maxScroll(), behavior: still ? "auto" : "smooth" });
    };
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      turning.current = null;
    };
  }, [unlocking, data]);

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
                className="course-stop"
                style={place(box)}
              >
                {isNext && (
                  <span className="course-stop-go" style={{ "--go": "var(--page-accent-color)" } as CSSProperties}>
                    <Play className="fill-current" strokeWidth={2.5} />
                    <span dir={dir}>{dict.ctaStart}</span>
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
