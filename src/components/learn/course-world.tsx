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

/** How long the camera takes to catch up with the scroll (its time constant,
    ms): the glide that makes it a camera rather than a scrubber, the same on
    any screen's refresh rate. */
const CAMERA_MS = 90;
/** The scroll still this long (ms) is at rest: the camera settles on a whole
    frame, sharp, never between two. */
const REST_MS = 110;
/** Sharp frames held, the way the camera is going and behind it. */
const AHEAD = 10;
const BEHIND = 3;
/** Sharp frames loading at once. */
const LOADING_AT_ONCE = 4;
/** Every this many frames, a small picture held for good: what a fast flick
    shows (it reads as motion blur) until the sharp ones arrive. */
const KEY_EVERY = 6;
const KEY_WIDTH = 400;
const KEYS_AT_ONCE = 2;
const KEYS_AFTER_MS = 400;
/** The scroll per way, `svh`, unless the course says: Shapes' four. */
const DEFAULT_RUN = 290;
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

/** The course a stop was just tapped in: only coming back from its lesson does
    the page open at the child's place; any other way in, at the first lesson. */
let leftForLesson: string | null = null;

/** Multiplies `tint` through the given ways' tiles of a frame's mask, so white
    stones keep their light and shade. `circle` (x, y, r) limits it: a way
    turning grows out from its lesson. */
function tintWays(target: CanvasRenderingContext2D, layer: CanvasRenderingContext2D, mask: ImageBitmap, tiles: readonly number[], ways: readonly number[], tint: string, circle?: readonly [number, number, number]) {
  const { width, height } = layer.canvas;
  const tile = mask.height / tiles.length;
  layer.globalCompositeOperation = "source-over";
  layer.clearRect(0, 0, width, height);
  let any = false;
  for (const way of ways) {
    const at = tiles.indexOf(way);
    if (at < 0) continue;
    layer.drawImage(mask, 0, tile * at, mask.width, tile, 0, 0, width, height);
    any = true;
  }
  if (!any) return;
  layer.globalCompositeOperation = "source-in";
  layer.fillStyle = tint;
  layer.fillRect(0, 0, width, height);
  if (circle) {
    layer.globalCompositeOperation = "destination-in";
    layer.beginPath();
    layer.arc(circle[0], circle[1], Math.max(0.5, circle[2]), 0, Math.PI * 2);
    layer.fillStyle = "#000";
    layer.fill();
  }
  target.globalCompositeOperation = "multiply";
  target.drawImage(layer.canvas, 0, 0);
  target.globalCompositeOperation = "source-over";
}

/** A frame off the network, decoded off the main thread (a picture decoded on
    first draw is the scroll's worst hitch). */
async function fetchBitmap(url: string, signal: AbortSignal, options?: ImageBitmapOptions) {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(url);
  return createImageBitmap(await response.blob(), options);
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
  const rekey = useRef<() => void>(() => undefined);
  /* The next camera position is a jump, not a glide (opening at a stop). */
  const jump = useRef(false);
  const returning = useRef(false);

  /* A way is pink once the lesson before it is done. */
  const pinkWays = !hydrated ? 0 : nextIndex < 0 ? ways : nextIndex;
  useEffect(() => {
    donePink.current = pinkWays;
    rekey.current();
    redraw.current();
  }, [pinkWays]);

  const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;
  /* Where on the page the camera stands nearest stop `i`. */
  const scrollFor = (i: number) => (1 - data.focus[i]) * maxScroll();

  /* Always opened by progress below, never where the browser last was (a
     reload left near the chest would open there). */
  useEffect(() => {
    const was = history.scrollRestoration;
    history.scrollRestoration = "manual";
    return () => {
      history.scrollRestoration = was;
    };
  }, []);

  /* The camera: follows the scroll with a glide; paints the two frames it
     stands between, lined up and the nearer showing through, so the 3D moves
     without steps;
     settles on a whole frame at rest. Sharp frames are held round it, the way
     it is going first; a fast flick that outruns them shows the small ones. */
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    const blend = document.createElement("canvas");
    const blendContext = blend.getContext("2d");
    const under = document.createElement("canvas");
    const underContext = under.getContext("2d");
    const layer = document.createElement("canvas");
    const layerContext = layer.getContext("2d");
    if (!canvas || !context || !blendContext || !underContext || !layerContext) return;
    canvas.width = blend.width = under.width = layer.width = data.first.width;
    canvas.height = blend.height = under.height = layer.height = data.first.height;
    const growFrom = [(data.flow[0] / 100) * canvas.width, (data.flow[1] / 100) * canvas.height];
    /* A frame grown by `scale` from where the picture grows from. */
    const drawGrown = (source: HTMLCanvasElement, scale: number) => {
      context.setTransform(scale, 0, 0, scale, growFrom[0] * (1 - scale), growFrom[1] * (1 - scale));
      context.drawImage(source, 0, 0);
      context.setTransform(1, 0, 0, 1, 0, 0);
    };

    const pictures = new Map<number, ImageBitmap>();
    const masks = new Map<number, ImageBitmap>();
    const keys = new Map<number, HTMLCanvasElement>();
    const loading = new Map<string, { frame: number; stop: AbortController }>();
    const everyWay = Array.from({ length: ways }, (_, way) => way);
    const tilesOf = (f: number) => data.maskWays?.[f] ?? everyWay;
    const parked = stopRefs.current.map(() => false);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const gone = new AbortController();
    let raf = 0;
    let current = -1;
    let standing = -1;
    let heading = 1;
    let lastTick = 0;
    let lastScroll = -Infinity;
    let width = window.innerWidth;
    /* Read once: `scrollHeight` every frame forces a layout, and a phone's bar
       sliding away must not move the camera. */
    let top = maxScroll();
    let keyRun = 0;
    let keyTimer = 0;

    const pinkNow = () => Math.max(donePink.current, turning.current ? turning.current[0] + 1 : 0);
    const needsMask = (f: number) => tilesOf(f).some((way) => way < pinkNow());
    /* A frame shows only with its mask: stones never flash white. */
    const ready = (f: number) => pictures.has(f) && (!needsMask(f) || masks.has(f));
    const held = (f: number) => (heading > 0 ? f - standing <= AHEAD && standing - f <= BEHIND : standing - f <= AHEAD && f - standing <= BEHIND);

    const ask = (name: string, f: number, map: Map<number, ImageBitmap>) => {
      if (map.has(f) || loading.has(name + f) || loading.size >= LOADING_AT_ONCE) return;
      const stop = new AbortController();
      loading.set(name + f, { frame: f, stop });
      fetchBitmap(fileUrl(data, name, f, name === "f" ? "jpg" : "png"), stop.signal)
        .then((bitmap) => {
          if (gone.signal.aborted) bitmap.close();
          else {
            map.get(f)?.close();
            map.set(f, bitmap);
          }
        })
        /* Called off, or missing: the frame just isn't there; others cover. */
        .catch(() => undefined)
        .finally(() => {
          loading.delete(name + f);
          if (gone.signal.aborted) return;
          ensure();
          wake();
        });
    };

    /* Let go what the camera has left, call off what it no longer needs, ask
       for what it is near, nearest first. */
    const ensure = () => {
      if (standing < 0) return;
      for (const map of [pictures, masks]) {
        for (const [f, bitmap] of map) {
          if (held(f)) continue;
          bitmap.close();
          map.delete(f);
        }
      }
      for (const { frame, stop } of loading.values()) if (!held(frame)) stop.abort();
      for (let d = 0; d <= AHEAD; d++) {
        for (const f of d <= BEHIND && d > 0 ? [standing + heading * d, standing - heading * d] : [standing + heading * d]) {
          if (f < 0 || f >= world.frames) continue;
          ask("f", f, pictures);
          if (needsMask(f)) ask("w", f, masks);
        }
      }
    };

    /* The small pictures, done ways tinted in. Again whenever a way is done. */
    const loadKeys = async (run: number, order: number[]) => {
      const small = document.createElement("canvas");
      const smallLayer = document.createElement("canvas").getContext("2d");
      while (run === keyRun && order.length > 0 && smallLayer) {
        const f = order.shift()!;
        try {
          const picture = await fetchBitmap(fileUrl(data, "f", f, "jpg"), gone.signal, { resizeWidth: KEY_WIDTH, resizeQuality: "medium" });
          const card = document.createElement("canvas");
          const cardContext = card.getContext("2d");
          card.width = small.width = smallLayer.canvas.width = picture.width;
          card.height = small.height = smallLayer.canvas.height = picture.height;
          cardContext?.drawImage(picture, 0, 0);
          picture.close();
          const done = tilesOf(f).filter((way) => way < donePink.current);
          if (cardContext && done.length > 0) {
            const mask = await fetchBitmap(fileUrl(data, "w", f, "png"), gone.signal);
            tintWays(cardContext, smallLayer, mask, tilesOf(f), done, tint);
            mask.close();
          }
          if (run === keyRun) keys.set(f, card);
        } catch {
          /* Called off, or missing: the sharp frames still play. */
        }
      }
    };
    rekey.current = () => {
      keyRun++;
      window.clearTimeout(keyTimer);
      const run = keyRun;
      keyTimer = window.setTimeout(() => {
        const at = Math.max(0, standing);
        const order = Array.from({ length: Math.ceil(world.frames / KEY_EVERY) }, (_, k) => k * KEY_EVERY).sort((a, b) => Math.abs(a - at) - Math.abs(b - at));
        for (let i = 0; i < KEYS_AT_ONCE; i++) void loadKeys(run, order);
      }, KEYS_AFTER_MS);
    };

    const compose = (target: CanvasRenderingContext2D, f: number, progress: number) => {
      target.drawImage(pictures.get(f)!, 0, 0);
      const mask = masks.get(f);
      if (!mask) return;
      const turn = turning.current;
      const whole = everyWay.filter((way) => way < donePink.current && way !== turn?.[0]);
      tintWays(target, layerContext, mask, tilesOf(f), whole, tint);
      if (!turn) return;
      const [ax, ay, aw, ah] = boxAt(data.keys, progress, turn[0]);
      const [bx, by, bw, bh] = boxAt(data.keys, progress, turn[0] + 1);
      const [cx, cy] = [((ax + aw / 2) * canvas.width) / 100, ((ay + ah) * canvas.height) / 100];
      const [dx, dy] = [((bx + bw / 2) * canvas.width) / 100, ((by + bh) * canvas.height) / 100];
      tintWays(target, layerContext, mask, tilesOf(f), [turn[0]], tint, [cx, cy, Math.hypot(dx - cx, dy - cy) * 1.15 * turn[1]]);
    };

    const nearest = (at: number, has: (f: number) => boolean, reach: number) => {
      for (let d = 0; d <= reach; d++) {
        if (has(at - d)) return at - d;
        if (has(at + d)) return at + d;
      }
      return -1;
    };

    const paint = (progress: number) => {
      const at = progress * (world.frames - 1);
      const wanted = Math.round(at);
      if (wanted !== standing) {
        if (standing >= 0) heading = wanted > standing ? 1 : -1;
        standing = wanted;
        ensure();
      }
      const low = Math.floor(at);
      const high = Math.min(world.frames - 1, low + 1);
      const mix = at - low;
      if (ready(low) && ready(high) && mix > 0.01 && high !== low) {
        /* Both frames carried to where the camera really is, so what stands
           in them lines up as one, then the nearer showing through. */
        const growth = data.flow[2] - 1;
        compose(underContext, low, progress);
        compose(blendContext, high, progress);
        drawGrown(under, 1 + mix * growth);
        context.globalAlpha = mix;
        drawGrown(blend, 1 / (1 + (1 - mix) * growth));
        context.globalAlpha = 1;
      } else if (ready(low)) {
        compose(context, low, progress);
      } else {
        const close = nearest(wanted, ready, 2);
        const key = close < 0 ? nearest(wanted, (f) => keys.has(f), world.frames) : -1;
        const far = close < 0 && key < 0 ? nearest(wanted, ready, world.frames) : -1;
        if (close >= 0 || far >= 0) compose(context, close >= 0 ? close : far, progress);
        else if (key >= 0) context.drawImage(keys.get(key)!, 0, 0, canvas.width, canvas.height);
      }
      stopRefs.current.forEach((element, i) => {
        if (!element) return;
        const box = boxAt(data.keys, progress, i);
        /* Off the picture it is left where it is: nothing to lay out. */
        const off = box[1] + box[3] < 0 || box[1] > 100 || box[0] + box[2] < 0 || box[0] > 100;
        if (!off || !parked[i]) Object.assign(element.style, place(box));
        parked[i] = off;
        /* The camera has gone past it. */
        element.style.visibility = box[2] > PAST || box[1] > 100 ? "hidden" : "";
      });
    };

    const tick = (now: number) => {
      raf = 0;
      /* The top of the page is the camera far in, at the first lesson; going
         down the page zooms it out, to the chest at the bottom. */
      const scroll = top > 0 ? 1 - Math.min(1, Math.max(0, window.scrollY / top)) : 1;
      const resting = now - lastScroll > REST_MS;
      const target = resting ? Math.round(scroll * (world.frames - 1)) / (world.frames - 1) : scroll;
      const elapsed = Math.min(64, now - lastTick);
      lastTick = now;
      current = current < 0 || still || jump.current ? target : current + (target - current) * (1 - Math.exp(-elapsed / CAMERA_MS));
      jump.current = false;
      if (Math.abs(target - current) < 0.0004) current = target;
      paint(current);
      if (current !== target || !resting) raf = requestAnimationFrame(tick);
    };
    function wake() {
      if (!raf) raf = requestAnimationFrame(tick);
    }
    const onScroll = () => {
      lastScroll = performance.now();
      wake();
    };
    const onResize = () => {
      if (window.innerWidth !== width) {
        width = window.innerWidth;
        top = maxScroll();
      }
      wake();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    lastTick = performance.now();
    wake();
    redraw.current = () => {
      if (current < 0) return;
      ensure();
      paint(current);
    };
    rekey.current();
    return () => {
      gone.abort();
      keyRun++;
      window.clearTimeout(keyTimer);
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      for (const { stop } of loading.values()) stop.abort();
      for (const map of [pictures, masks]) {
        for (const bitmap of map.values()) bitmap.close();
        map.clear();
      }
      redraw.current = rekey.current = () => undefined;
    };
  }, [data, world.frames, ways, tint]);

  /* Once progress is known: open at the stop the child carries on from. */
  useEffect(() => {
    if (!hydrated || opened.current) return;
    opened.current = true;
    /* Coming in (the user, 2026-11-06), whatever is done: the very top, the
       first lesson, the farthest from the chest. Back from a lesson: the
       child's place, a stop nearer the chest; all done, the chest. */
    returning.current = leftForLesson === lessonId;
    leftForLesson = null;
    jump.current = true;
    window.scrollTo(0, !returning.current || nextIndex === 0 ? 0 : scrollFor(nextIndex < 0 ? data.focus.length - 1 : nextIndex));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `scrollFor` only reads `data`.
  }, [hydrated, nextIndex, data, lessonId]);

  /* Back from a lesson just done: stand at it, turn its way pink stone by
     stone, then the camera goes on to the next one. */
  useEffect(() => {
    if (unlocking < 1 || !returning.current) return;
    const way = unlocking - 1;
    jump.current = true;
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
                onClick={() => {
                  leftForLesson = lessonId;
                }}
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
