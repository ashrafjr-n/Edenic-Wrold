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
/** Frames kept either side of where the camera stands; the rest are let go
    (a long course's frames, all held, would not fit a phone). */
const WINDOW = 8;
/** The masks (heavier, ten tiles a sheet) are held nearer still. */
const MASK_WINDOW = 5;
/** Shapes' scroll height, `svh`. */
const DEFAULT_RUN = 340;
/** Wider than this (% of the frame) it is passing the camera, or behind it. */
const PAST = 75;
/** What a done way's white stones are multiplied by, unless the course says: Pinki's pink. */
const WAY_PINK = "#ff86b4";
/** A way turning pink, stone by stone, from the lesson just done. */
const TURN_MS = 1500;
/** Before it starts; then the camera goes on to the next lesson. */
const TURN_DELAY_MS = 500;

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
 * numbers. It opens where the child carries on: the first lesson is the
 * farthest, at the top of the page; down the page the camera zooms out, to the
 * chest, the nearest, at the bottom.
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
  /* The ways between the lessons: one fewer than the stops. */
  const ways = data.keys[0].length - 1;
  const tint = world.tint ?? WAY_PINK;
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
  const pinkWays = !hydrated ? 0 : nextIndex < 0 ? ways : nextIndex;
  useEffect(() => {
    donePink.current = pinkWays;
    redraw.current();
  }, [pinkWays]);

  const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;
  /* Where on the page the camera stands nearest stop `i`. */
  const scrollFor = (i: number) => (1 - data.focus[i]) * maxScroll();

  /* The camera: load the frames, follow the scroll with a glide, paint the
     nearest frame loaded, carry the links along. */
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    /* Only the frames near the camera are held (`WINDOW`); a mask only while a
       way it shows is pink or turning pink. */
    const pictures = new Map<number, HTMLImageElement>();
    const masks = new Map<number, HTMLImageElement>();
    const asked = new Set<string>();
    const layer = document.createElement("canvas");
    const layerContext = layer.getContext("2d");
    const wayLists = data.maskWays;
    let cancelled = false;
    let raf = 0;
    let current = -1;
    /* The frame the camera stands at; none until the first paint. */
    let standing = -1;
    let loading = 0;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* The ways whose stones are pink now, or turning: 0..n. */
    const pinkNow = () => Math.max(donePink.current, turning.current ? turning.current[0] + 1 : 0);
    const needsMask = (f: number) => Math.abs(f - standing) <= MASK_WINDOW && (wayLists ? wayLists[f].length > 0 && wayLists[f][0] < pinkNow() : pinkNow() > 0);

    /* Let go what the camera has left; ask for what it is near, nearest first. */
    const ensure = () => {
      if (cancelled) return;
      for (const [kind, map, reach] of [["p", pictures, WINDOW], ["m", masks, MASK_WINDOW]] as const) {
        for (const f of [...map.keys()]) {
          if (Math.abs(f - standing) <= reach + 2) continue;
          map.delete(f);
          asked.delete(kind + f);
        }
      }
      for (let d = 0; d <= WINDOW && loading < LOADING_AT_ONCE; d++) {
        for (const f of d ? [standing - d, standing + d] : [standing]) {
          if (f < 0 || f >= world.frames) continue;
          ask("p", f, "jpg", pictures);
          if (needsMask(f)) ask("m", f, "png", masks);
        }
      }
    };
    const ask = (kind: "p" | "m", f: number, type: string, map: Map<number, HTMLImageElement>) => {
      if (asked.has(kind + f) || loading >= LOADING_AT_ONCE) return;
      asked.add(kind + f);
      loading++;
      const picture = new window.Image();
      const done = () => {
        loading--;
        ensure();
      };
      picture.onload = () => {
        if (Math.abs(f - standing) <= (kind === "p" ? WINDOW : MASK_WINDOW) + 2) map.set(f, picture);
        else asked.delete(kind + f);
        wake();
        done();
      };
      picture.onerror = () => {
        asked.delete(kind + f);
        done();
      };
      picture.src = fileUrl(data, kind === "p" ? "f" : "w", f, type);
    };

    const paint = (progress: number) => {
      const wanted = Math.round(progress * (world.frames - 1));
      if (wanted !== standing) {
        standing = wanted;
        ensure();
      }
      let found = -1;
      for (let d = 0; d <= WINDOW + 2 && found < 0; d++) {
        if (pictures.has(wanted - d)) found = wanted - d;
        else if (pictures.has(wanted + d)) found = wanted + d;
      }
      if (found >= 0) {
        const picture = pictures.get(found)!;
        if (canvas.width !== picture.naturalWidth) {
          canvas.width = layer.width = picture.naturalWidth;
          canvas.height = layer.height = picture.naturalHeight;
        }
        context.drawImage(picture, 0, 0);
        const mask = masks.get(found);
        if (mask && layerContext) {
          /* The ways turned pink: white stones multiplied by the tint keep
             their light and shade. All the done ways go through the layer at
             once; a way turning grows out from its lesson, on its own. */
          const turn = turning.current;
          const list = wayLists ? wayLists[found] : Array.from({ length: ways }, (_, way) => way);
          const tile = mask.naturalHeight / list.length;
          const lay = (wanted: number[], circle?: [number, number, number]) => {
            layerContext.globalCompositeOperation = "source-over";
            layerContext.clearRect(0, 0, layer.width, layer.height);
            let any = false;
            for (const way of wanted) {
              const at = list.indexOf(way);
              if (at < 0) continue;
              layerContext.drawImage(mask, 0, tile * at, mask.naturalWidth, tile, 0, 0, layer.width, layer.height);
              any = true;
            }
            if (!any) return;
            layerContext.globalCompositeOperation = "source-in";
            layerContext.fillStyle = tint;
            layerContext.fillRect(0, 0, layer.width, layer.height);
            if (circle) {
              layerContext.globalCompositeOperation = "destination-in";
              layerContext.beginPath();
              layerContext.arc(circle[0], circle[1], Math.max(0.5, circle[2]), 0, Math.PI * 2);
              layerContext.fillStyle = "#000";
              layerContext.fill();
            }
            context.globalCompositeOperation = "multiply";
            context.drawImage(layer, 0, 0);
            context.globalCompositeOperation = "source-over";
          };
          lay(Array.from({ length: donePink.current }, (_, way) => way).filter((way) => way !== turn?.[0]));
          if (turn) {
            const way = turn[0];
            const [ax, ay, aw, ah] = boxAt(data.keys, progress, way);
            const [bx, by, bw, bh] = boxAt(data.keys, progress, way + 1);
            const [cx, cy] = [((ax + aw / 2) * layer.width) / 100, ((ay + ah) * layer.height) / 100];
            const [dx, dy] = [((bx + bw / 2) * layer.width) / 100, ((by + bh) * layer.height) / 100];
            lay([way], [cx, cy, Math.hypot(dx - cx, dy - cy) * 1.15 * turn[1]]);
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
      /* The top of the page is the camera far in, at the first lesson; going
         down the page zooms it out, to the chest at the bottom. */
      const target = top > 0 ? 1 - Math.min(1, Math.max(0, window.scrollY / top)) : 1;
      current = current < 0 || still ? target : current + (target - current) * GLIDE;
      if (Math.abs(target - current) < 0.0004) current = target;
      paint(current);
      if (current !== target) raf = requestAnimationFrame(tick);
    };
    function wake() {
      if (!raf) raf = requestAnimationFrame(tick);
    }

    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("resize", wake);
    wake();
    redraw.current = () => {
      ensure();
      paint(Math.max(0, current));
    };
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", wake);
      window.removeEventListener("resize", wake);
    };
  }, [data, world.frames, wide, ways, tint]);

  /* Once progress is known: open at the stop the child carries on from. */
  useEffect(() => {
    if (!hydrated || opened.current) return;
    opened.current = true;
    /* A new child stays at the very top, the first lesson; all done, the chest. */
    if (nextIndex !== 0) window.scrollTo(0, scrollFor(nextIndex < 0 ? data.focus.length - 1 : nextIndex));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `scrollFor` only reads `data`.
  }, [hydrated, nextIndex, data]);

  /* Back from a lesson just done: stand at it, turn its way pink stone by
     stone, then the camera goes on to the next one. */
  useEffect(() => {
    if (unlocking < 1) return;
    const way = unlocking - 1;
    window.scrollTo(0, scrollFor(way));
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
      window.scrollTo({ top: scrollFor(unlocking), behavior: still ? "auto" : "smooth" });
    };
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      turning.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `scrollFor` only reads `data`.
  }, [unlocking, data]);

  return (
    <div ref={rootRef}>
      {/* The height the scroll runs through; nothing is laid on it. */}
      <div className="course-world-run" style={{ height: `${world.run ?? DEFAULT_RUN}svh` }} />

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
            const box = data.keys[data.keys.length - 1][i];
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
                onFocus={() => window.scrollTo(0, scrollFor(i))}
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
