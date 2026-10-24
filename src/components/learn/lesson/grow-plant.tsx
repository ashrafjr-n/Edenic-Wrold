"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from "react";
import Image, { type StaticImageData } from "next/image";
import { ChevronsRight, Sparkle, Sprout } from "lucide-react";
import { Celebration } from "@/components/ui/celebration";
import { GROW_RATIO } from "@/data/grow";
import { lessonCue, playCue } from "@/lib/cue";
import type { GrowScene, GrowSheet } from "@/types/course";
import { ClayWord } from "./clay-word";
import { place } from "./find-shapes";

/** Past this the knob is home — a finger never quite reaches the very end. */
const HOME = 0.97;
/** The vegetable is whole, then the step is solved. */
const DONE_MS = 1100;
/** A key moves the knob this far (PageUp/PageDown: `BIG_STEP`). */
const STEP = 0.05;
const BIG_STEP = 0.2;
/** How closely the plant follows the knob: the time (s) it takes to make
    up ~63% of the way — it grows after the finger, never jumps. */
const FOLLOW_S = 0.16;
/** The knob leans the way it is dragged: degrees per px moved, and most. */
const LEAN_PER_PX = 1.6;
const LEAN_MAX = 16;

/* `--scene-w`: the picture's width, capped by the height a step has — less
   the knob's line over it — so it never pushes the page into a scroll
   (`--ratio` is its w/h). Phone and tablet: over the word; desktop: beside
   it, the column as wide as the picture. */
const COLUMN_SIZE =
  "[--scene-w:min(100%,calc((100svh-30rem-min(2.5rem,4svh))*var(--ratio)))] sm:[--scene-w:min(30rem,calc((100svh-49rem)*var(--ratio)))] lg:w-[var(--scene-w)] lg:[--scene-w:min(34rem,calc((var(--stage-h)-5.5rem)*var(--ratio)))]";

/* Crumbs thrown up where the shoot breaks the soil: where each lands
   (cqi of the picture, from the foot) and when it goes (s). Fixed — this
   renders on the server too. */
const CRUMBS = [[-6, -5, 0], [5, -6.5, 0.04], [-3, -8, 0.08], [8, -3.5, 0.02], [-8.5, -2.5, 0.06], [2, -9, 0.1], [6.5, -7.5, 0.12]] as const;
/* Sparkles round the vegetable once it is whole: offset (cqi), delay (s). */
const SPARKLES = [[-12, -10, 0], [11, -12, 0.25], [14, 4, 0.5], [-13, 6, 0.75], [1, -16, 0.4], [-2, 12, 0.6]] as const;

/** How wide the frame is painted, in each layout: `vw` on a phone, `rem`
    from `sm` and from `lg`. */
export interface GrowPaint {
  vw: number;
  sm: number;
  lg: number;
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/**
 * One sheet of frames on a canvas, at `value` (0–1): the two frames either
 * side of it cross-dissolved — the first drawn at 1 − a, the next ADDED at
 * a (`lighter` adds premultiplied colour, so where both are opaque it stays
 * opaque: a true dissolve, the soil never showing through mid-way).
 */
function SheetCanvas({ sheet, frames, cols, value, style }: { sheet: GrowSheet; frames: number; cols: number; value: number; style: CSSProperties }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    let live = true;
    const img = new window.Image();
    img.src = sheet.src.src;
    img.decode().then(
      () => live && setImage(img),
      () => undefined,
    );
    return () => {
      live = false;
    };
  }, [sheet.src.src]);

  useEffect(() => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx || !image) return;
    const [w, h] = sheet.cell;
    const f = clamp01(value) * (frames - 1);
    const i = Math.min(frames - 1, Math.floor(f));
    const a = f - i;
    const draw = (k: number) => ctx.drawImage(image, (k % cols) * w, Math.floor(k / cols) * h, w, h, 0, 0, w, h);
    ctx.clearRect(0, 0, w, h);
    ctx.globalAlpha = a > 0.001 ? 1 - a : 1;
    draw(i);
    if (a > 0.001 && i + 1 < frames) {
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = a;
      draw(i + 1);
      ctx.globalCompositeOperation = "source-over";
    }
    ctx.globalAlpha = 1;
  }, [image, value, sheet.cell, frames, cols]);

  return <canvas ref={canvas} width={sheet.cell[0]} height={sheet.cell[1]} aria-hidden className="absolute block" style={style} />;
}

/**
 * The soil cut open and the plant in it as it is at `value` (0–1): the
 * soil, what grows under it, then what grows above it — that part swaying
 * a little about its foot, more as it grows, as a plant does. Drawn, not
 * played: whoever holds it moves `value` (the knob, or the demo).
 */
export function GrowStage({ scene, value, paint, cheer = false, className = "" }: { scene: GrowScene; value: number; paint: GrowPaint; cheer?: boolean; className?: string }) {
  const { ground, frames, cols, above, below } = scene;
  const gw = ground.box[2] / 100;
  const sizes = `(min-width: 1024px) ${(paint.lg * gw).toFixed(2)}rem, (min-width: 640px) ${(paint.sm * gw).toFixed(2)}rem, ${(paint.vw * gw).toFixed(2)}vw`;
  return (
    <div className={`relative w-full ${className}`} style={{ aspectRatio: GROW_RATIO }}>
      {/* Its shadow on the board — the render has none. */}
      <span
        aria-hidden
        className="absolute h-[9%] rounded-[50%] bg-[radial-gradient(closest-side,rgb(var(--shadow-hue)/0.32),transparent)]"
        style={{ left: `${ground.box[0] + 4}%`, width: `${ground.box[2] - 8}%`, top: `${ground.box[1] + ground.box[3] - 5}%` }}
      />
      <span className="absolute block" style={place(ground.box)}>
        <Image src={ground.src} alt="" fill loading="eager" sizes={sizes} draggable={false} className="select-none object-contain" />
      </span>
      <SheetCanvas sheet={below} frames={frames} cols={cols} value={value} style={place(below.box)} />
      <span
        aria-hidden
        className={`grow-sway absolute block ${cheer ? "grow-cheer" : ""}`}
        style={{ ...place(above.box), transformOrigin: `${above.foot[0]}% ${above.foot[1]}%`, "--sway": Math.min(1, value * 1.4).toFixed(2) } as CSSProperties}
      >
        <SheetCanvas sheet={above} frames={frames} cols={cols} value={value} style={{ inset: 0, width: "100%", height: "100%" }} />
      </span>
    </div>
  );
}

/** Where the plant's foot is, % of the frame. */
function footOf({ above }: GrowScene): [number, number] {
  return [above.box[0] + (above.foot[0] * above.box[2]) / 100, above.box[1] + (above.foot[1] * above.box[3]) / 100];
}

interface GrowPlantProps {
  /** The vegetable, in English. */
  word: string;
  /** Its picture, waiting faintly at the line's right end. */
  picture: StaticImageData;
  scene: GrowScene;
  /** What to do, in the child's language — the knob's name for a screen
      reader. */
  label: string;
  /** The course's colour: the knob and the line behind it. */
  tone: { face: string; edge: string; ink: string };
  onSolved: () => void;
}

/**
 * Grow it (Nova's Vegetables, direct request 2026-10-24): a line with a
 * knob at its left end; slide the knob to the right end and the vegetable
 * grows from its seed in the soil under the line — 32 rendered moments of
 * it (`render.cjs grow`), cross-dissolved, so a stem lengthens, leaves
 * unfold one by one, roots branch, a carrot grows long then swells, a
 * tomato flowers, sets, swells and ripens. The plant follows the knob a
 * little behind (`FOLLOW_S`), so it grows rather than jumps; slid back, it
 * shrinks again. Where the shoot breaks the soil, crumbs fly. Nothing can
 * go wrong — reaching the right end is the lesson. A keyboard moves the
 * knob with the arrow keys (it is a `slider`).
 */
export function GrowPlant({ word, picture, scene, label, tone, onSolved }: GrowPlantProps) {
  /* Where the knob is, and how far the plant has grown (following it). */
  const [knob, setKnob] = useState(0);
  const [shown, setShown] = useState(0);
  const [held, setHeld] = useState(false);
  const [touched, setTouched] = useState(false);
  const [done, setDone] = useState(false);
  const [lean, setLean] = useState(0);
  const [burst, setBurst] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  /* Where on the knob the finger took it (px from its middle), its last x. */
  const grab = useRef(0);
  const lastX = useRef(0);
  const shownRef = useRef(0);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);
  const after = (ms: number, run: () => void) => {
    timers.current.push(window.setTimeout(run, ms));
  };

  /* The plant follows the knob, eased frame by frame. Breaking the soil on
     the way up throws crumbs (and a tiny buzz, where a phone has one). */
  useEffect(() => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let last = performance.now();
    const step = (now: number) => {
      const from = shownRef.current;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const next = still || Math.abs(knob - from) < 0.0006 ? knob : from + (knob - from) * (1 - Math.exp(-dt / FOLLOW_S));
      if (from < scene.emerge && next >= scene.emerge) {
        setBurst((n) => n + 1);
        navigator.vibrate?.(8);
      }
      shownRef.current = next;
      setShown(next);
      if (next !== knob) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [knob, scene.emerge]);

  const finish = () => {
    setKnob(1);
    setHeld(false);
    setLean(0);
    setDone(true);
    navigator.vibrate?.([10, 40, 14]);
    after(350, () => void playCue(lessonCue.word(word)));
    after(DONE_MS, onSolved);
  };

  const moveTo = (value: number) => {
    if (done) return;
    setTouched(true);
    if (value >= HOME) finish();
    else setKnob(clamp01(value));
  };

  /* The knob's middle travels from half a knob in to half a knob short of
     the end. */
  const at = (clientX: number) => {
    const box = track.current?.getBoundingClientRect();
    if (!box) return 0;
    return (clientX - grab.current - box.left - box.height / 2) / Math.max(1, box.width - box.height);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (done) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const box = event.currentTarget.getBoundingClientRect();
    grab.current = event.clientX - (box.left + box.width / 2);
    lastX.current = event.clientX;
    setHeld(true);
    setTouched(true);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (!held) return;
    setLean(Math.max(-LEAN_MAX, Math.min(LEAN_MAX, (event.clientX - lastX.current) * LEAN_PER_PX)));
    lastX.current = event.clientX;
    moveTo(at(event.clientX));
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    setHeld(false);
    setLean(0);
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    const by = { ArrowRight: STEP, ArrowUp: STEP, ArrowLeft: -STEP, ArrowDown: -STEP, PageUp: BIG_STEP, PageDown: -BIG_STEP }[event.key];
    if (by !== undefined) moveTo(knob + by);
    else if (event.key === "Home") moveTo(0);
    else if (event.key === "End") moveTo(1);
    else return;
    event.preventDefault();
  };

  /* The knob's left edge, and the coloured line up to its middle. */
  const run = `calc(${knob} * (100% - var(--knob)))`;
  const near = knob > 0.82 && !done;
  const [fx, fy] = footOf(scene);

  return (
    <div className="card card-clay-white card-bare-lg flex w-full max-w-2xl flex-col items-center gap-3 px-3 py-4 sm:gap-5 sm:px-8 sm:py-6 lg:max-w-4xl lg:flex-row lg:justify-center lg:gap-12 lg:py-2 [@media(max-height:700px)]:gap-2 [@media(max-height:700px)]:py-3">
      <div className={`flex w-full flex-col items-center gap-2 sm:gap-3 ${COLUMN_SIZE}`} style={{ "--ratio": GROW_RATIO } as CSSProperties}>
        {/* The line: always left to right (layout never mirrors). */}
        {/* Never shorter than 17rem, even over a small picture — a finger
            needs room to slide. */}
        <div ref={track} data-grow-track dir="ltr" className="relative h-[var(--knob)] w-full max-w-[max(17rem,var(--scene-w))] shrink-0 [--knob:3.5rem] sm:[--knob:4rem] lg:max-w-none">
          <span aria-hidden className="absolute inset-x-[calc(var(--knob)/2)] top-1/2 h-3.5 -translate-y-1/2 rounded-full bg-black/25 shadow-[inset_0_2px_3px_rgb(0_0_0/0.4),0_1px_0_rgb(255_255_255/0.08)] sm:h-4" />
          <span
            aria-hidden
            className={`absolute left-[calc(var(--knob)/2)] top-1/2 h-3.5 -translate-y-1/2 rounded-full sm:h-4 ${held ? "" : "transition-[width] duration-300 ease-out"}`}
            style={{ width: run, backgroundColor: tone.face, boxShadow: `inset 0 -3px 0 ${tone.edge}, inset 0 2px 0 rgb(255 255 255 / 0.45)` }}
          />
          {!touched && (
            <span aria-hidden className="absolute inset-y-0 left-1/2 flex -translate-x-1/2 items-center text-white/80">
              <ChevronsRight className="grow-hint h-7 w-7" strokeWidth={2.75} />
            </span>
          )}
          {/* Home: where the knob goes — the vegetable waits there, faint;
              its ring turns slowly, brightens as the knob nears and bursts
              when it arrives. */}
          <span aria-hidden className="absolute right-0 top-0 h-[var(--knob)] w-[var(--knob)]">
            {done ? (
              <span className="grow-ring-burst absolute inset-0 rounded-full border-4 border-white" />
            ) : (
              <span className={`absolute inset-0 rounded-full transition-[scale,background-color] duration-300 ${near ? "scale-110 bg-white/10" : "bg-black/15"}`}>
                <span className={`grow-ring absolute inset-0 rounded-full border-[3px] border-dashed transition-colors duration-300 ${near ? "border-white" : "border-white/55"}`} />
                <span className={`absolute inset-[15%] block transition-[opacity,filter] duration-300 ${near ? "opacity-90" : "opacity-50 grayscale-[35%]"}`}>
                  <Image src={picture} alt="" fill sizes="3rem" className="object-contain" />
                </span>
              </span>
            )}
          </span>
          <span
            role="slider"
            tabIndex={done ? -1 : 0}
            aria-label={label}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(knob * 100)}
            aria-valuetext={`${Math.round(knob * 100)}%`}
            aria-disabled={done || undefined}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onKeyDown={onKeyDown}
            className={`clay grow-knob absolute top-0 z-[1] flex h-[var(--knob)] w-[var(--knob)] touch-none select-none items-center justify-center rounded-full focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[var(--page-accent-color)] ${
              done ? "cursor-default" : held ? "grow-knob--held cursor-grabbing" : "cursor-grab"
            }`}
            style={{ left: run, backgroundColor: tone.face, color: tone.ink, "--clay-edge": tone.edge } as CSSProperties}
          >
            {/* Until it is first taken, it glows (on a span of its own:
                `.guide-target` sets `position`, which would beat `absolute`). */}
            {!touched && <span aria-hidden className="guide-target pointer-events-none absolute inset-0 rounded-full" />}
            <span className={`flex transition-[rotate] duration-200 ease-out ${touched ? "" : "grow-nudge"} ${done ? "anim-jump" : ""}`} style={{ rotate: `${lean}deg` }}>
              <Sprout className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={2.5} />
            </span>
          </span>
        </div>

        <div className="relative w-full max-w-[var(--scene-w)] [container-type:inline-size]">
          <GrowStage scene={scene} value={shown} paint={{ vw: 92, sm: 30, lg: 34 }} cheer={done} />
          {/* Crumbs, where the shoot broke through. */}
          {burst > 0 && (
            <span key={burst} aria-hidden className="pointer-events-none absolute inset-0">
              {CRUMBS.map(([x, y, delay], i) => (
                <span
                  key={i}
                  className="grow-crumb absolute block h-[1.6cqi] w-[1.6cqi] rounded-full"
                  style={{ left: `${fx}%`, top: `${fy}%`, backgroundColor: i % 2 ? "#8a5a36" : "#a5714a", animationDelay: `${delay}s`, "--to-x": `${x}cqi`, "--to-y": `${y}cqi` } as CSSProperties}
                />
              ))}
            </span>
          )}
          {/* Sparkles round the vegetable, once it is whole. */}
          {done && (
            <span aria-hidden className="pointer-events-none absolute inset-0">
              {SPARKLES.map(([x, y, delay], i) => (
                <span key={i} className="grow-twinkle absolute block" style={{ left: `calc(${scene.veg[0]}% + ${x}cqi)`, top: `calc(${scene.veg[1]}% + ${y}cqi)`, animationDelay: `${delay}s` }}>
                  <Sparkle className="-ml-[2.5cqi] -mt-[2.5cqi] h-[5cqi] w-[5cqi] fill-[#fff6c8] text-[#fff6c8] drop-shadow-[0_0_4px_rgb(255_240_160/0.9)]" strokeWidth={1.5} />
                </span>
              ))}
            </span>
          )}
          {done && <Celebration />}
        </div>
      </div>

      {/* English in every locale: never mirrored. No speaker — the word card
          is where it is heard. */}
      <div dir="ltr" className={`flex items-center justify-center lg:shrink-0 ${done ? "anim-jump" : ""}`}>
        <ClayWord word={word} size="sm" />
      </div>
    </div>
  );
}
