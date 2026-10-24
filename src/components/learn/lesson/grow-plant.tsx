"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from "react";
import Image, { type StaticImageData } from "next/image";
import { ChevronsRight, Sprout } from "lucide-react";
import { Celebration } from "@/components/ui/celebration";
import { GROW_RATIO } from "@/data/grow";
import { lessonCue, playCue } from "@/lib/cue";
import type { GrowPart, GrowScene } from "@/types/course";
import { ClayWord } from "./clay-word";
import { place } from "./find-shapes";

/** Past this the knob is home — a finger never quite reaches the very end. */
const HOME = 0.96;
/** The vegetable is whole, then the step is solved. */
const DONE_MS = 900;
/** A key moves the knob this far (PageUp/PageDown: `BIG_STEP`). */
const STEP = 0.1;
const BIG_STEP = 0.25;

/* The picture's width, capped by the height a step has — less the knob's
   line over it — so it never pushes the page into a scroll (`--ratio` is
   its w/h). Phone and tablet: over the word; desktop: beside it. */
const COLUMN_SIZE =
  "max-w-[min(100%,calc((100svh-30rem-min(2.5rem,4svh))*var(--ratio)))] sm:max-w-[min(30rem,calc((100svh-49rem)*var(--ratio)))] lg:max-w-[min(34rem,calc((var(--stage-h)-5.5rem)*var(--ratio)))]";

/** How wide the frame is painted, in each layout: `vw` on a phone, `rem`
    from `sm` and from `lg`. */
export interface GrowPaint {
  vw: number;
  sm: number;
  lg: number;
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/** A part's place, the point it grows from and its stretch of the slide —
    the `.grow-part` rule does the rest from `--grow`. */
function partStyle({ box, from, grows, shows, fades }: GrowPart): CSSProperties {
  return {
    ...place(box),
    transformOrigin: `${from[0]}% ${from[1]}%`,
    ...(grows && { "--g0": grows[0], "--g1": grows[1] }),
    ...(shows && { "--s0": shows[0], "--s1": shows[1] }),
    ...(fades && { "--f0": fades[0], "--f1": fades[1] }),
  } as CSSProperties;
}

/**
 * The soil cut open and the plant in it, as far grown as `--grow` says
 * (set by whoever holds it: the knob, or the demo's animation). Drawn, not
 * played — no state of its own.
 */
export function GrowStage({ scene, paint, className = "", style }: { scene: GrowScene; paint: GrowPaint; className?: string; style?: CSSProperties }) {
  const sizes = (width: number) =>
    `(min-width: 1024px) ${((paint.lg * width) / 100).toFixed(2)}rem, (min-width: 640px) ${((paint.sm * width) / 100).toFixed(2)}rem, ${((paint.vw * width) / 100).toFixed(2)}vw`;
  const { ground, parts } = scene;
  return (
    <div className={`relative w-full ${className}`} style={{ aspectRatio: GROW_RATIO, ...style }}>
      {/* Its shadow on the board — the render has none. */}
      <span
        aria-hidden
        className="absolute h-[9%] rounded-[50%] bg-[radial-gradient(closest-side,rgb(var(--shadow-hue)/0.32),transparent)]"
        style={{ left: `${ground.box[0] + 4}%`, width: `${ground.box[2] - 8}%`, top: `${ground.box[1] + ground.box[3] - 5}%` }}
      />
      <span className="absolute block" style={place(ground.box)}>
        <Image src={ground.src} alt="" fill loading="eager" sizes={sizes(ground.box[2])} draggable={false} className="select-none object-contain" />
      </span>
      {parts.map((part, i) => (
        <span key={i} className="grow-part absolute block" style={partStyle(part)}>
          <Image src={part.src} alt="" fill loading="eager" sizes={sizes(part.box[2])} draggable={false} className="select-none object-contain" />
        </span>
      ))}
    </div>
  );
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
 * grows from its seed in the soil under the line — roots, then what comes
 * up, then the vegetable itself (a carrot or a potato swelling under the
 * ground; a tomato or a pepper flowering, then green, then ripe). Slid
 * back, it shrinks again; the plant follows the knob, a little behind, so
 * it seems to grow rather than jump. Nothing can go wrong — reaching the
 * right end is the lesson. A keyboard moves the knob with the arrow keys
 * (it is a `slider`).
 */
export function GrowPlant({ word, picture, scene, label, tone, onSolved }: GrowPlantProps) {
  const [grown, setGrown] = useState(0);
  const [held, setHeld] = useState(false);
  const [touched, setTouched] = useState(false);
  const [done, setDone] = useState(false);
  const track = useRef<HTMLDivElement>(null);
  /* Where on the knob the finger took it (px from its middle). */
  const grab = useRef(0);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const finish = () => {
    setGrown(1);
    setHeld(false);
    setDone(true);
    void playCue(lessonCue.word(word));
    timer.current = window.setTimeout(onSolved, DONE_MS);
  };

  const moveTo = (value: number) => {
    if (done) return;
    setTouched(true);
    if (value >= HOME) finish();
    else setGrown(clamp01(value));
  };

  /* The knob's middle travels from half a knob in to half a knob short of
     the end. */
  const at = (clientX: number) => {
    const box = track.current?.getBoundingClientRect();
    if (!box) return 0;
    const knob = box.height;
    return (clientX - grab.current - box.left - knob / 2) / Math.max(1, box.width - knob);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (done) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const knob = event.currentTarget.getBoundingClientRect();
    grab.current = event.clientX - (knob.left + knob.width / 2);
    setHeld(true);
    setTouched(true);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (held) moveTo(at(event.clientX));
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    setHeld(false);
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    const by = { ArrowRight: STEP, ArrowUp: STEP, ArrowLeft: -STEP, ArrowDown: -STEP, PageUp: BIG_STEP, PageDown: -BIG_STEP }[event.key];
    if (by !== undefined) moveTo(grown + by);
    else if (event.key === "Home") moveTo(0);
    else if (event.key === "End") moveTo(1);
    else return;
    event.preventDefault();
  };

  /* The knob's left edge, and the coloured line up to its middle. */
  const run = `calc(${grown} * (100% - var(--knob)))`;

  return (
    <div className="card card-clay-white card-bare-lg flex w-full max-w-2xl flex-col items-center gap-3 px-3 py-4 sm:gap-5 sm:px-8 sm:py-6 lg:max-w-4xl lg:flex-row lg:justify-center lg:gap-12 lg:py-2 [@media(max-height:700px)]:gap-2 [@media(max-height:700px)]:py-3">
      <div className={`flex w-full flex-col items-center gap-2 sm:gap-3 ${COLUMN_SIZE}`} style={{ "--ratio": GROW_RATIO } as CSSProperties}>
        {/* The line: always left to right (layout never mirrors). */}
        <div ref={track} data-grow-track dir="ltr" className="relative h-[var(--knob)] w-full shrink-0 [--knob:3.5rem] sm:[--knob:4rem]">
          <span aria-hidden className="absolute inset-x-[calc(var(--knob)/2)] top-1/2 h-3.5 -translate-y-1/2 rounded-full bg-black/25 shadow-[inset_0_2px_3px_rgb(0_0_0/0.35)] sm:h-4" />
          <span
            aria-hidden
            className={`absolute left-[calc(var(--knob)/2)] top-1/2 h-3.5 -translate-y-1/2 rounded-full sm:h-4 ${held ? "" : "transition-[width] duration-300 ease-out"}`}
            style={{ width: run, backgroundColor: tone.face, boxShadow: `inset 0 -2px 0 ${tone.edge}` }}
          />
          {!touched && (
            <span aria-hidden className="absolute inset-y-0 left-1/2 flex -translate-x-1/2 items-center text-white/80">
              <ChevronsRight className="grow-hint h-7 w-7" strokeWidth={2.75} />
            </span>
          )}
          {/* Home: where the knob goes — the vegetable waits there, faint. */}
          <span
            aria-hidden
            className={`absolute right-0 top-0 flex h-[var(--knob)] w-[var(--knob)] items-center justify-center rounded-full border-[3px] border-dashed transition-opacity duration-300 ${done ? "opacity-0" : "border-white/60 bg-black/15"}`}
          >
            <span className="relative block h-[70%] w-[70%] opacity-55 grayscale-[35%]">
              <Image src={picture} alt="" fill sizes="3rem" className="object-contain" />
            </span>
          </span>
          <span
            role="slider"
            tabIndex={done ? -1 : 0}
            aria-label={label}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(grown * 100)}
            aria-valuetext={`${Math.round(grown * 100)}%`}
            aria-disabled={done || undefined}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={() => setHeld(false)}
            onKeyDown={onKeyDown}
            className={`clay absolute top-0 z-[1] flex h-[var(--knob)] w-[var(--knob)] touch-none select-none items-center justify-center rounded-full focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[var(--page-accent-color)] ${
              done ? "cursor-default" : held ? "cursor-grabbing" : "cursor-grab"
            } ${held ? "scale-110" : "transition-[left,scale] duration-300 ease-out"} ${touched ? "" : "guide-target"}`}
            style={{ left: run, backgroundColor: tone.face, color: tone.ink, "--clay-edge": tone.edge } as CSSProperties}
          >
            <span className={`flex ${touched ? "" : "grow-nudge"} ${done ? "anim-jump" : ""}`}>
              <Sprout className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={2.5} />
            </span>
          </span>
        </div>

        <div className="relative w-full">
          <GrowStage scene={scene} paint={{ vw: 92, sm: 30, lg: 34 }} className="grow-scene" style={{ "--grow": grown } as CSSProperties} />
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
