"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { Lock, Play } from "lucide-react";
import { seenOf, useCourseUnlock } from "@/components/learn/use-course-unlock";
import { format } from "@/lib/format-dict";
import { useWide } from "@/lib/use-wide";
import { usePageTransition } from "@/store/page-transition";
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
/** The stage a guided course stands the lesson at: where its box is centred
    (% of the frame down) — under the middle, where the Start button is. */
const STAGE_Y = 70;
/** The camera's move from one lesson to the next, ms. */
const MOVE_MS = 2300;
/** After the clouds have cleared and the picture is there, Start waits this
    long, then comes in gently, ms. */
const START_AFTER_MS = 450;
/** A closed lesson's colour coming back, ms. */
const REVEAL_MS = 700;
/** The longest the camera waits for the frames of its way to arrive, ms. */
const WAIT_FRAMES_MS = 2500;
/** A closed lesson: its colour taken out, then a flat light silver over it. */
const SILVER = "#c9cdd6";
const SILVER_LIGHT = "#e4e7ee";
const SILVER_FLAT = 0.68;
/** The ground behind the picture while it loads (the scene's own pink). */
const GROUND = "#f7b9d5";
/** What a done way's white stones are multiplied by, unless the course says: Pinki's pink. */
const WAY_PINK = "#ff86b4";
/** A way turning pink, stone by stone, from the lesson just done. */
const TURN_MS = 1500;
/** Before the camera sets off for the next lesson, ms. */
const TURN_DELAY_MS = 300;
/** The camera's move to it; the stones start turning this long after it sets
    off, so the camera is ahead of the colour. */
const CAMERA_RUN_MS = 1900;
const STONES_LAG_MS = 350;

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

/** Lays the tiles (of a frame's mask sheet) that are asked for on `layer`, at
    the mask's own size — half the picture's, so a quarter of the pixels to
    move. Whether any was there. */
function stampTiles(layer: CanvasRenderingContext2D, mask: ImageBitmap, tiles: readonly number[], wanted: readonly number[]) {
  const tile = mask.height / tiles.length;
  if (layer.canvas.width !== mask.width || layer.canvas.height !== tile) {
    layer.canvas.width = mask.width;
    layer.canvas.height = tile;
  }
  layer.globalCompositeOperation = "source-over";
  layer.clearRect(0, 0, mask.width, tile);
  let any = false;
  for (const one of wanted) {
    const at = tiles.indexOf(one);
    if (at < 0) continue;
    layer.drawImage(mask, 0, tile * at, mask.width, tile, 0, 0, mask.width, tile);
    any = true;
  }
  return any;
}

/** Multiplies `tint` through the given ways' tiles of a frame's mask, so white
    stones keep their light and shade. `circle` (x, y, r, in the picture's
    pixels) limits it: a way turning grows out from its lesson. */
function tintWays(target: CanvasRenderingContext2D, layer: CanvasRenderingContext2D, mask: ImageBitmap, tiles: readonly number[], ways: readonly number[], tint: string, circle?: readonly [number, number, number]) {
  if (!stampTiles(layer, mask, tiles, ways)) return;
  const { width, height } = layer.canvas;
  layer.globalCompositeOperation = "source-in";
  layer.fillStyle = tint;
  layer.fillRect(0, 0, width, height);
  if (circle) {
    const k = width / target.canvas.width;
    layer.globalCompositeOperation = "destination-in";
    layer.beginPath();
    layer.arc(circle[0] * k, circle[1] * k, Math.max(0.5, circle[2] * k), 0, Math.PI * 2);
    layer.fillStyle = "#000";
    layer.fill();
  }
  target.globalCompositeOperation = "multiply";
  target.drawImage(layer.canvas, 0, 0, width, height, 0, 0, target.canvas.width, target.canvas.height);
  target.globalCompositeOperation = "source-over";
}

/** Greys the given drops (their tiles of a frame's drop sheet): the colour is
    taken out keeping the clay's light, then a light silver laid over it, `amount`
    1 closed .. 0 open. */
function silverDrops(target: CanvasRenderingContext2D, layer: CanvasRenderingContext2D, mask: ImageBitmap, tiles: readonly number[], drops: readonly number[], amount: number) {
  if (!stampTiles(layer, mask, tiles, drops)) return;
  const { width, height } = layer.canvas;
  const [w, h] = [target.canvas.width, target.canvas.height];
  layer.globalCompositeOperation = "source-in";
  layer.fillStyle = SILVER;
  layer.fillRect(0, 0, width, height);
  target.globalAlpha = amount;
  target.globalCompositeOperation = "color";
  target.drawImage(layer.canvas, 0, 0, width, height, 0, 0, w, h);
  layer.fillStyle = SILVER_LIGHT;
  layer.fillRect(0, 0, width, height);
  target.globalCompositeOperation = "source-over";
  target.globalAlpha = amount * SILVER_FLAT;
  target.drawImage(layer.canvas, 0, 0, width, height, 0, 0, w, h);
  target.globalAlpha = 1;
}

const easeInOut = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2);
const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));
/** Until the clouds that brought the child here have cleared (at most 4 s):
    what plays when the page opens is seen, not played under them. */
async function cloudsGone() {
  for (let i = 0; i < 40 && usePageTransition.getState().active; i++) await wait(100);
}

/** The guided camera's state, held outside the engine so it survives the
    engine being built again (a turned screen, a double mount in development). */
interface Guide {
  /** The lesson the camera stands at; -1 until it is told. */
  stop: number;
  /** A move to another lesson: the frames of its way are waited for first
      (`start` < 0), then it runs; `done` when it arrives. */
  tween: { from: number; to: number; ms: number; asked: number; start: number; onStep: (p: number) => void; done: () => void } | null;
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
  /* Played one lesson at a time while one is left; when all are done, the scroll. */
  const guided = Boolean(world.guided) && (!hydrated || nextIndex >= 0);
  const opened = useRef(false);
  /* The ways pink by now, and the one turning: [its index, how far 0..1]. */
  const donePink = useRef(0);
  const turning = useRef<[number, number] | null>(null);
  const redraw = useRef<() => void>(() => undefined);
  const rekey = useRef<() => void>(() => undefined);
  /* The next camera position is a jump, not a glide (opening at a stop). */
  const jump = useRef(false);
  const returning = useRef(false);
  /* Guided (Colors): where the camera stands, which lessons are still closed
     (grey from this one on), the one getting its colour back, whether it
     is guided right now, and the engine's hooks. */
  const guide = useRef<Guide>({ stop: -1, tween: null });
  const lockedFrom = useRef(Infinity);
  const reveal = useRef<{ stop: number; amount: number } | null>(null);
  const guidedNow = useRef(false);
  const kick = useRef<() => void>(() => undefined);
  const resync = useRef<() => void>(() => undefined);
  const painted = useRef<() => void>(() => undefined);
  const alive = useRef(false);
  const [settled, setSettled] = useState(false);
  const [shown, setShown] = useState(false);

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
    canvas.width = blend.width = under.width = data.first.width;
    canvas.height = blend.height = under.height = data.first.height;
    const growFrom = [(data.flow[0] / 100) * canvas.width, (data.flow[1] / 100) * canvas.height];
    /* A frame grown by `scale` from where the picture grows from. */
    const drawGrown = (source: HTMLCanvasElement, scale: number) => {
      context.setTransform(scale, 0, 0, scale, growFrom[0] * (1 - scale), growFrom[1] * (1 - scale));
      context.drawImage(source, 0, 0);
      context.setTransform(1, 0, 0, 1, 0, 0);
    };

    const pictures = new Map<number, ImageBitmap>();
    const masks = new Map<number, ImageBitmap>();
    const dropMasks = new Map<number, ImageBitmap>();
    const keys = new Map<number, HTMLCanvasElement>();
    const loading = new Map<string, { frame: number; stop: AbortController }>();
    const everyWay = Array.from({ length: ways }, (_, way) => way);
    const tilesOf = (f: number) => data.maskWays?.[f] ?? everyWay;
    const dropsOf = (f: number) => data.dropWays?.[f] ?? [];
    /* The camera at a lesson, stood where its box is centred under the middle
       (a whole frame, so it is sharp). */
    const stageAt = Array.from({ length: data.keys[0].length }, (_, stop) => {
      let best = 0;
      let off = Infinity;
      for (let f = 0; f < world.frames; f++) {
        const [, y, , h] = boxAt(data.keys, f / (world.frames - 1), stop);
        if (Math.abs(y + h / 2 - STAGE_Y) < off) [best, off] = [f, Math.abs(y + h / 2 - STAGE_Y)];
      }
      return best / (world.frames - 1);
    });
    const framesOf = (from: number, to: number): [number, number] => {
      const [a, b] = [stageAt[from], stageAt[to]].map((t) => Math.round(t * (world.frames - 1)));
      return [Math.max(0, Math.min(a, b) - 1), Math.min(world.frames - 1, Math.max(a, b) + 1)];
    };
    let corridor: [number, number] | null = null;
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
    /* The drops still closed in a frame (grey), and the one getting its colour. */
    const closedIn = (f: number) => (guidedNow.current ? dropsOf(f).filter((drop) => drop >= lockedFrom.current && drop < ways) : []);
    const needsDrops = (f: number) => closedIn(f).length > 0 || (guidedNow.current && reveal.current !== null && dropsOf(f).includes(reveal.current.stop));
    /* A frame shows only with its masks: stones never flash white, a closed
       lesson never flashes its colour. */
    const ready = (f: number) => pictures.has(f) && (!needsMask(f) || masks.has(f)) && (!needsDrops(f) || dropMasks.has(f));
    const held = (f: number) => (corridor !== null && f >= corridor[0] && f <= corridor[1]) || (heading > 0 ? f - standing <= AHEAD && standing - f <= BEHIND : standing - f <= AHEAD && f - standing <= BEHIND);

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
      for (const map of [pictures, masks, dropMasks]) {
        for (const [f, bitmap] of map) {
          if (held(f)) continue;
          bitmap.close();
          map.delete(f);
        }
      }
      for (const { frame, stop } of loading.values()) if (!held(frame)) stop.abort();
      const want = (f: number) => {
        if (f < 0 || f >= world.frames) return;
        ask("f", f, pictures);
        if (needsMask(f)) ask("w", f, masks);
        if (needsDrops(f)) ask("d", f, dropMasks);
      };
      /* The frames of the camera's coming move first, nearest where it stands. */
      if (corridor) {
        for (const f of Array.from({ length: corridor[1] - corridor[0] + 1 }, (_, i) => corridor![0] + i).sort((a, b) => Math.abs(a - standing) - Math.abs(b - standing))) want(f);
      }
      for (let d = 0; d <= AHEAD; d++) {
        for (const f of d <= BEHIND && d > 0 ? [standing + heading * d, standing - heading * d] : [standing + heading * d]) want(f);
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
          card.width = small.width = picture.width;
          card.height = small.height = picture.height;
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
        /* Guided, nobody flicks the camera: no small pictures. */
        if (guidedNow.current) return;
        const at = Math.max(0, standing);
        const order = Array.from({ length: Math.ceil(world.frames / KEY_EVERY) }, (_, k) => k * KEY_EVERY).sort((a, b) => Math.abs(a - at) - Math.abs(b - at));
        for (let i = 0; i < KEYS_AT_ONCE; i++) void loadKeys(run, order);
      }, KEYS_AFTER_MS);
    };

    const compose = (target: CanvasRenderingContext2D, f: number, progress: number) => {
      target.drawImage(pictures.get(f)!, 0, 0);
      const drops = dropMasks.get(f);
      if (drops && guidedNow.current) {
        const closed = closedIn(f);
        if (closed.length > 0) silverDrops(target, layerContext, drops, dropsOf(f), closed, 1);
        if (reveal.current && reveal.current.amount > 0) silverDrops(target, layerContext, drops, dropsOf(f), [reveal.current.stop], reveal.current.amount);
      }
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
      let drew = true;
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
        /* Guided: only a frame next to where it stands, never a small or a far
           one — a closed lesson must not show its colour. */
        const key = close < 0 && !guidedNow.current ? nearest(wanted, (f) => keys.has(f), world.frames) : -1;
        const far = close < 0 && key < 0 && !guidedNow.current ? nearest(wanted, ready, world.frames) : -1;
        if (close >= 0 || far >= 0) compose(context, close >= 0 ? close : far, progress);
        else if (key >= 0) context.drawImage(keys.get(key)!, 0, 0, canvas.width, canvas.height);
        else if (guidedNow.current) drew = false;
      }
      if (drew) painted.current();
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

    /* Guided: the camera stands at a lesson, or goes from one to the next once
       the frames of its way are here; the page tells it with `guide`. */
    const guidedTick = (now: number) => {
      const g = guide.current;
      const tw = g.tween;
      let t = -1;
      if (tw) {
        if (tw.start < 0 && (still || now - tw.asked > WAIT_FRAMES_MS || (corridor !== null && Array.from({ length: corridor[1] - corridor[0] + 1 }, (_, i) => corridor![0] + i).every(ready)))) tw.start = now;
        if (tw.start >= 0) {
          const p = still || tw.ms <= 0 ? 1 : Math.min(1, (now - tw.start) / tw.ms);
          t = stageAt[tw.from] + (stageAt[tw.to] - stageAt[tw.from]) * easeInOut(p);
          tw.onStep(p);
          if (p >= 1) {
            g.stop = tw.to;
            g.tween = null;
            corridor = null;
            t = stageAt[tw.to];
            tw.done();
          }
        } else t = stageAt[tw.from];
      } else if (g.stop >= 0) t = stageAt[g.stop];
      if (t >= 0) {
        current = t;
        paint(t);
      }
      if (g.tween || reveal.current) raf = requestAnimationFrame(tick);
    };

    const tick = (now: number) => {
      raf = 0;
      if (guidedNow.current) {
        guidedTick(now);
        return;
      }
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
    kick.current = () => {
      /* A new place or a move: the frames of its way are asked for now. */
      const g = guide.current;
      if (g.tween) corridor = framesOf(g.tween.from, g.tween.to);
      else if (g.stop >= 0) corridor = null;
      if (g.stop >= 0 && standing < 0) standing = Math.round(stageAt[g.stop] * (world.frames - 1));
      ensure();
      wake();
    };
    resync.current = () => {
      top = maxScroll();
      current = -1;
      wake();
    };
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
      for (const map of [pictures, masks, dropMasks]) {
        for (const bitmap of map.values()) bitmap.close();
        map.clear();
      }
      redraw.current = rekey.current = kick.current = resync.current = () => undefined;
    };
  }, [data, world.frames, ways, tint]);

  /* Only mounted while it is (a double mount in development mounts twice). */
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  /* Guided: nothing scrolls while a lesson is left. */
  useEffect(() => {
    guidedNow.current = guided;
    if (!guided) return;
    const page = document.documentElement;
    const was = page.style.overflow;
    page.style.overflow = "hidden";
    window.scrollTo(0, 0);
    kick.current();
    return () => {
      page.style.overflow = was;
    };
  }, [guided]);

  /* Guided: the camera to a lesson, and a lesson getting its colour back. */
  const stand = (stop: number) => {
    guide.current = { stop, tween: null };
    lockedFrom.current = stop + 1;
    reveal.current = null;
    kick.current();
  };
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const playUnlock = async (to: number) => {
    const from = to - 1;
    guide.current = { stop: from, tween: null };
    /* The lesson it opens is still closed; its way still white. */
    lockedFrom.current = to;
    turning.current = [from, 0];
    kick.current();
    await cloudsGone();
    await wait(reduced() ? 0 : TURN_DELAY_MS);
    if (!alive.current) return;
    await new Promise<void>((done) => {
      guide.current.tween = { from, to, ms: reduced() ? 0 : MOVE_MS, asked: performance.now(), start: -1, onStep: (p) => (turning.current = [from, p]), done };
      kick.current();
    });
    turning.current = null;
    if (!alive.current) return;
    /* There: the next lesson gets its colour (the chest never was grey). */
    lockedFrom.current = to + 1;
    if (to < ways) {
      const started = performance.now();
      reveal.current = { stop: to, amount: 1 };
      kick.current();
      await new Promise<void>((done) => {
        const step = (now: number) => {
          const p = reduced() ? 1 : Math.min(1, (now - started) / REVEAL_MS);
          if (reveal.current) reveal.current.amount = 1 - p;
          if (p < 1 && alive.current) requestAnimationFrame(step);
          else done();
        };
        requestAnimationFrame(step);
      });
      reveal.current = null;
      kick.current();
    }
    await wait(reduced() ? 0 : START_AFTER_MS);
    if (alive.current) setSettled(true);
  };

  /* Once progress is known: where it opens. */
  useEffect(() => {
    if (!hydrated || opened.current) return;
    opened.current = true;
    returning.current = leftForLesson === lessonId;
    leftForLesson = null;
    if (world.guided && nextIndex >= 0) {
      /* Guided: at the child's lesson, nothing to scroll; back from a lesson
         that opened the next, its way turns and the camera goes on. */
      const seen = seenOf(characterId, lessonId);
      if (nextIndex > 0 && seen !== undefined && seen < nextIndex) void playUnlock(nextIndex);
      else {
        stand(nextIndex);
        /* Start comes once the clouds are gone, never over them. */
        void cloudsGone()
          .then(() => wait(reduced() ? 0 : START_AFTER_MS))
          .then(() => alive.current && setSettled(true));
      }
      return;
    }
    /* Scrolling: always opens at the child's place (the user, 2026-11-09, undoing
       2026-11-06's "the very top"): the lesson with Start whatever its order; all
       done, the gold chest. */
    resync.current();
    jump.current = true;
    window.scrollTo(0, scrollFor(nextIndex < 0 ? data.focus.length - 1 : nextIndex));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `scrollFor` and `playUnlock` only read what is here.
  }, [hydrated, nextIndex, data, lessonId]);

  /* Scrolling: back from a lesson just done, stand at it, then the camera goes
     on to the next one and the way turns pink stone by stone just BEHIND it
     (the user, 2026-11-06: the camera led late, on a phone worst). Its own
     eased scroll, never the browser's smooth one — a phone's lags and cannot
     be timed against the stones. */
  useEffect(() => {
    if (world.guided || unlocking < 1 || !returning.current) return;
    const way = unlocking - 1;
    jump.current = true;
    const [from, to] = [scrollFor(way), scrollFor(unlocking)];
    window.scrollTo(0, from);
    turning.current = [way, 0];
    redraw.current();
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const started = performance.now() + TURN_DELAY_MS;
    let raf = 0;
    const stop = () => cancelAnimationFrame(raf);
    /* A finger or wheel mid-turn: the way is done, so it is pink whole at once. Left
       half-turned, the pink circle (centred by the scroll) would travel with every
       scroll and the stones would change colour as the child moves. */
    const release = () => {
      stop();
      turning.current = null;
      redraw.current();
    };
    const step = (now: number) => {
      const t = Math.max(0, now - started);
      const move = still ? 1 : Math.min(1, t / CAMERA_RUN_MS);
      const turn = still ? 1 : Math.min(1, Math.max(0, (t - STONES_LAG_MS) / TURN_MS));
      window.scrollTo(0, from + (to - from) * easeInOut(move));
      turning.current = [way, turn];
      redraw.current();
      if (move < 1 || turn < 1) raf = requestAnimationFrame(step);
      else turning.current = null;
    };
    raf = requestAnimationFrame(step);
    /* A finger or wheel takes the camera back. */
    window.addEventListener("wheel", release, { passive: true, once: true });
    window.addEventListener("touchstart", release, { passive: true, once: true });
    return () => {
      stop();
      window.removeEventListener("wheel", release);
      window.removeEventListener("touchstart", release);
      turning.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `scrollFor` only reads `data`.
  }, [unlocking, data]);

  /* The first picture painted: the Start button may come. */
  useEffect(() => {
    painted.current = () => {
      painted.current = () => undefined;
      setShown(true);
    };
  }, []);

  /* Guided: Shapes' Start above the lesson, but it only comes in once the clouds are gone and the camera is still. */
  const showStart = guided && hydrated && settled && shown && nextIndex >= 0;

  return (
    <div ref={rootRef}>
      {/* The height the scroll runs through; nothing is laid on it. Guided, none. */}
      <div className="course-world-run" style={{ height: guided ? 0 : `${world.run ?? DEFAULT_RUN}svh` }} />

      <div className="world-frame -z-[5]" aria-hidden>
        <div className="world-cover" style={{ ...worldCover(wide), ...(world.guided ? { backgroundColor: GROUND } : null) }}>
          {/* A guided course paints its first frame itself: it must not show
              what is closed (or already done) for a moment. */}
          {!world.guided && <Image src={data.first} alt="" fill preload sizes="100vw" className="object-cover" />}
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
        </div>
      </div>

      <div
        className="world-frame course-world-stops z-10"
        /* Pinki's pink shadows stay hers; Nova's badge and lock chip cast her own, Bloo's his (a deep blue). */
        style={characterId === "pinki" ? undefined : ({ "--go-shadow": "color-mix(in srgb, var(--page-accent-edge) 65%, transparent)", "--mark-shadow": characterId === "bloo" ? "rgb(40 90 150 / 35%)" : "rgb(70 50 120 / 35%)" } as CSSProperties)}
      >
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
                  {/* Guided: the grey is the sign it is closed. */}
                  {!world.guided && (
                    <span className="course-stop-mark">
                      <Lock strokeWidth={2.75} />
                    </span>
                  )}
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
                onFocus={() => {
                  if (!guided) window.scrollTo(0, scrollFor(i));
                }}
                onClick={() => {
                  leftForLesson = lessonId;
                }}
                className="course-stop"
                style={place(box)}
              >
                {isNext && (
                  <span className="course-stop-go" data-shown={world.guided ? showStart : undefined} style={{ "--go": "var(--page-accent-color)" } as CSSProperties}>
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
