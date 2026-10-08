"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import Image from "next/image";
import { Droplet, Snowflake, Sparkle, Wind, type LucideIcon } from "lucide-react";
import { Celebration } from "@/components/ui/celebration";
import { BLOO } from "@/data/bloo-wear";
import { format } from "@/lib/format-dict";
import { lessonCue, playCue } from "@/lib/cue";
import type { Wear, Weather } from "@/types/course";
import { ClayWord } from "./clay-word";

/** A thing going on Bloo. */
const FLY_MS = 650;
/** All of it on, then the step is solved — after a look at the weather. */
const DONE_MS = 1400;
/** Below this the finger never really moved — a tap, not a drag. */
const DRAG_THRESHOLD = 8;

/* The scene, in % of its width (`cqi`): Bloo `BLOO_W` wide in the middle,
   with room over him for what goes above his head (worked out from what
   he wears in this lesson, `reach`), and the two things waiting in `TRAY`
   squares at his feet, one each side. */
const BLOO_W = 54;
const BLOO_LEFT = (100 - BLOO_W) / 2;
const BLOO_H = (BLOO_W * BLOO.picture.height) / BLOO.picture.width;
const TRAY = 22;
const TRAY_AT = [0.5, 77.5];
const FLOOR = 2;

/* The scene's width, capped by the height a step has so it never pushes
   the page into a scroll (`--ratio` is its w/h). Phone and tablet: over
   the word; desktop: beside it. */
const SCENE_SIZE =
  "max-w-[min(100%,calc((100svh-26rem-min(2.5rem,4svh))*var(--ratio)))] sm:max-w-[min(32rem,calc((100svh-44rem)*var(--ratio)))] lg:max-w-[min(38rem,calc((var(--stage-h)-2rem)*var(--ratio)))]";

/** The weather coming once Bloo is ready: what falls, blows or twinkles
    over him. */
const WEATHER_FX: Record<Weather, { icon: LucideIcon; motion: "fall" | "drift" | "twinkle"; color: string; filled: boolean }> = {
  sunny: { icon: Sparkle, motion: "twinkle", color: "#ffc531", filled: true },
  rainy: { icon: Droplet, motion: "fall", color: "#4f9fe6", filled: true },
  windy: { icon: Wind, motion: "drift", color: "#7fbcef", filled: false },
  snowy: { icon: Snowflake, motion: "fall", color: "#8cc4f2", filled: false },
};
/** Where each bit of it starts (% across, % down) and when (s) — fixed,
    never random: this renders on the server too. */
const FX_BITS = [[6, 4, 0], [20, 26, 0.5], [34, 10, 1.1], [50, 34, 0.3], [64, 6, 0.8], [78, 24, 0.2], [90, 40, 1.3], [12, 52, 0.9], [42, 60, 1.5], [72, 56, 0.6]] as const;

/** A worn thing's box on the scene (cqi), Bloo's top `top` cqi down. */
function placed(item: Wear, top: number) {
  const [x, y, w] = item.at;
  const width = (w * BLOO_W) / 100;
  const height = (width * item.src.height) / item.src.width;
  return { cx: BLOO_LEFT + (x * BLOO_W) / 100, cy: top + (y * BLOO_H) / 100, width, height };
}

/** How far over Bloo's head a thing reaches (cqi), turned as it is. */
function reach(item: Wear) {
  const { cy, width, height } = placed(item, 0);
  const turn = (item.turn * Math.PI) / 180;
  return (Math.abs(width * Math.sin(turn)) + Math.abs(height * Math.cos(turn))) / 2 - cy;
}

/** A point on Bloo's picture (% of it) on the scene (cqi). */
const onBloo = (x: number, y: number, top: number) => [BLOO_LEFT + (x * BLOO_W) / 100, top + (y * BLOO_H) / 100];

interface Drag {
  index: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  moved: boolean;
}

interface DressBlooProps {
  /** The weather, in English. */
  word: Weather;
  /** What he wears for it — [the one waiting on his left, on his right]. */
  wear: readonly Wear[];
  /** "Put the {thing} on Bloo" — each thing's name for a screen reader. */
  wearAria: string;
  onSolved: () => void;
}

/**
 * Dress Bloo: Bloo himself (his own picture) and what he wears for the
 * weather waiting at his feet. Drag a thing onto him, or tap it, and it
 * flies to where it goes — a hat under his horns, glasses on his eyes, an
 * umbrella or a kite into his raised hand — turned as his head is. All of
 * it on → the weather comes over him (rain, snow, wind, sunshine), its word
 * is said and it jumps. Nothing can go wrong: everything there is this
 * weather's (the one-thing lesson rule); a thing let go anywhere else goes
 * back.
 *
 * Every worn thing is drawn from the start, hidden, so none arrives late;
 * the waiting copy flies onto its place (WAAPI — the same picture, moved,
 * turned and grown) and then hands over to it.
 */
export function DressBloo({ word, wear, wearAria, onSolved }: DressBlooProps) {
  const [on, setOn] = useState<number[]>([]);
  const [flying, setFlying] = useState<number | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const blooRef = useRef<HTMLSpanElement>(null);
  const thingRefs = useRef<(HTMLSpanElement | null)[]>([]);
  /* What a tap reads — taps outrun renders. */
  const busy = useRef(false);
  const worn = useRef<number[]>([]);
  /* A drag ends in a click on the same thing — that click is not a tap. */
  const dragged = useRef(false);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);
  const after = (ms: number, run: () => void) => {
    timers.current.push(window.setTimeout(run, ms));
  };

  const top = Math.max(0, ...wear.map(reach)) + 2;
  const ratio = 100 / (top + BLOO_H + FLOOR);
  const full = on.length === wear.length;
  const fx = WEATHER_FX[word];

  const springBack = (index: number, dx: number, dy: number) =>
    thingRefs.current[index]?.animate([{ translate: `${dx}px ${dy}px` }, { translate: "0px 0px" }], { duration: 260, easing: "ease-out" });

  /** Thing `index` goes on: a tap on it, or a drop on Bloo `offset` away
      from where it waited. */
  const putOn = (index: number, offset = { dx: 0, dy: 0 }) => {
    if (busy.current || worn.current.includes(index)) return;
    busy.current = true;
    const thing = thingRefs.current[index];
    const scene = sceneRef.current;
    if (thing && scene) {
      /* Worked out from where it waits, not where the finger has it. */
      const from = thing.getBoundingClientRect();
      const box = scene.getBoundingClientRect();
      const cqi = box.width / 100;
      const { cx, cy, width } = placed(wear[index], top);
      const x = box.left + cx * cqi - (from.left + from.width / 2 - offset.dx);
      const y = box.top + cy * cqi - (from.top + from.height / 2 - offset.dy);
      thing.animate(
        [
          { translate: `${offset.dx}px ${offset.dy}px`, rotate: "0deg", scale: "1" },
          { translate: `${x}px ${y}px`, rotate: `${wear[index].turn}deg`, scale: `${(width * cqi) / from.width}` },
        ],
        { duration: FLY_MS, easing: "cubic-bezier(0.34, 1.15, 0.5, 1)", fill: "forwards" },
      );
    }
    setFlying(index);
    after(FLY_MS, () => {
      worn.current = [...worn.current, index];
      setOn(worn.current);
      setFlying(null);
      if (worn.current.length < wear.length) {
        busy.current = false;
        return;
      }
      void playCue(lessonCue.word(word));
      after(DONE_MS, onSolved);
    });
  };

  /* ---- Dragging a thing; a real drag ends on Bloo or springs back ---- */
  const onPointerDown = (index: number) => (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (busy.current) return;
    dragged.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ index, x: event.clientX, y: event.clientY, dx: 0, dy: 0, moved: false });
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!drag) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    setDrag({ ...drag, dx, dy, moved: drag.moved || Math.hypot(dx, dy) > DRAG_THRESHOLD });
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!drag) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    const { index, dx, dy, moved } = drag;
    setDrag(null);
    /* A tap: the click that follows takes it. */
    if (!moved) return;
    dragged.current = true;
    window.setTimeout(() => (dragged.current = false), 0);
    const box = blooRef.current?.getBoundingClientRect();
    const over = box && event.clientX >= box.left && event.clientX <= box.right && event.clientY >= box.top && event.clientY <= box.bottom;
    if (over) putOn(index, { dx, dy });
    else springBack(index, dx, dy);
  };

  /* Each worn thing in its layer, drawn from the start and shown once on. */
  const layer = (which: Wear["layer"]) =>
    wear.map((item, i) => {
      if (item.layer !== which) return null;
      const { cx, cy, width, height } = placed(item, top);
      return (
        <span
          key={i}
          className={`pointer-events-none absolute block ${on.includes(i) ? "" : "invisible"}`}
          style={{ left: `${cx - width / 2}cqi`, top: `${cy - height / 2}cqi`, width: `${width}cqi`, height: `${height}cqi`, rotate: `${item.turn}deg` }}
        >
          <Image src={item.src} alt="" fill loading="eager" sizes="(min-width: 1024px) 24rem, 50vw" draggable={false} className="select-none object-contain" />
        </span>
      );
    });

  const FxIcon = fx.icon;
  return (
    <div className="card card-clay-white card-bare-lg flex w-full max-w-2xl flex-col items-center gap-3 px-3 py-4 sm:gap-5 sm:px-8 sm:py-6 lg:max-w-4xl lg:flex-row lg:justify-center lg:gap-12 lg:py-2 [@media(max-height:700px)]:gap-2 [@media(max-height:700px)]:py-3">
      <div ref={sceneRef} className={`relative w-full [container-type:inline-size] ${SCENE_SIZE}`} style={{ aspectRatio: ratio, "--ratio": ratio } as CSSProperties}>
        {layer("behind")}
        {/* A kite's string, from the kite to his raised hand. */}
        {wear.map((item, i) => {
          if (!item.string) return null;
          const [x1, y1] = onBloo(item.string[0], item.string[1], top);
          const [x2, y2] = onBloo(item.string[2], item.string[3], top);
          return (
            <span
              key={`string-${i}`}
              aria-hidden
              className={`pointer-events-none absolute block h-[0.6cqi] origin-left rounded-full bg-white shadow-[0_0_0_0.15cqi_rgb(var(--shadow-hue)/0.18)] ${on.includes(i) ? "" : "invisible"}`}
              style={{ left: `${x1}cqi`, top: `${y1}cqi`, width: `${Math.hypot(x2 - x1, y2 - y1)}cqi`, rotate: `${Math.atan2(y2 - y1, x2 - x1)}rad` }}
            />
          );
        })}
        <span
          ref={blooRef}
          className={`absolute block ${full ? "anim-jump" : ""}`}
          style={{ left: `${BLOO_LEFT}cqi`, top: `${top}cqi`, width: `${BLOO_W}cqi`, height: `${BLOO_H}cqi` }}
        >
          <Image src={BLOO.picture} alt="" fill loading="eager" sizes="(min-width: 1024px) 22rem, 55vw" draggable={false} className="pointer-events-none select-none object-contain" />
        </span>
        {layer("head")}
        {/* His horns, over a hat — they come through it. */}
        <span className="pointer-events-none absolute block" style={{ left: `${BLOO_LEFT}cqi`, top: `${top}cqi`, width: `${BLOO_W}cqi`, height: `${BLOO_H}cqi` }}>
          <Image src={BLOO.horns} alt="" fill loading="eager" sizes="(min-width: 1024px) 22rem, 55vw" draggable={false} className="select-none object-contain" />
        </span>
        {layer("front")}

        {wear.map((item, index) => {
          if (on.includes(index)) return null;
          /* Where the finger has it, while it is being dragged. */
          const held = drag?.index === index && drag.moved ? drag : null;
          const aspect = item.src.width / item.src.height;
          return (
            <span
              key={index}
              className="absolute block"
              style={{ left: `${TRAY_AT[index]}cqi`, top: `${top + BLOO_H - TRAY}cqi`, width: `${TRAY}cqi`, height: `${TRAY}cqi` }}
            >
              <button
                type="button"
                aria-label={format(wearAria, { thing: item.word })}
                onClick={() => {
                  if (!dragged.current) putOn(index);
                }}
                onPointerDown={onPointerDown(index)}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={() => setDrag(null)}
                /* `touch-action: none` or a drag scrolls the page instead. */
                className={`card card-clay-white absolute inset-0 flex touch-none select-none items-center justify-center focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[var(--page-accent-color)] ${
                  held || flying === index ? "z-20" : ""
                } ${held ? "cursor-grabbing" : "cursor-grab"}`}
              >
                {/* Until the first thing is on, the first one glows. */}
                <span className={`flex h-[80%] w-[80%] items-center justify-center ${on.length === 0 && index === 0 && !held ? "guide-target" : ""}`}>
                  <span
                    ref={(el) => {
                      thingRefs.current[index] = el;
                    }}
                    className="pointer-events-none relative block"
                    style={{
                      width: aspect >= 1 ? "100%" : `${aspect * 100}%`,
                      height: aspect >= 1 ? `${100 / aspect}%` : "100%",
                      ...(held ? { translate: `${held.dx}px ${held.dy}px`, scale: "1.1" } : {}),
                    }}
                  >
                    <Image src={item.src} alt="" fill loading="eager" sizes="(min-width: 1024px) 8rem, 20vw" draggable={false} className="object-contain" />
                  </span>
                </span>
              </button>
            </span>
          );
        })}

        {/* The weather comes. */}
        {full && (
          <span aria-hidden className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
            {FX_BITS.map(([x, y, delay], i) => (
              <span key={i} className={`wx-${fx.motion} absolute block h-[7cqi] w-[7cqi]`} style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${delay}s`, color: fx.color }}>
                <FxIcon className={`h-full w-full ${fx.filled ? "fill-current" : ""}`} strokeWidth={2.25} />
              </span>
            ))}
          </span>
        )}
        {full && <Celebration />}
      </div>

      {/* English in every locale: never mirrored. No speaker — the word card
          is where it is heard. */}
      <div dir="ltr" className={`flex items-center justify-center lg:shrink-0 ${full ? "anim-jump" : ""}`}>
        <ClayWord word={word} size="sm" />
      </div>
    </div>
  );
}
