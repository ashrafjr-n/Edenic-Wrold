"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import Image from "next/image";
import { Celebration } from "@/components/ui/celebration";
import { lessonCue, playCue } from "@/lib/cue";
import type { Gesture, Weather, WeatherScene } from "@/types/course";
import { ClayWord } from "./clay-word";
import { place } from "./find-shapes";

/** Three goes make the weather. */
const GOES = 3;
/** A new frame fading in over the last — kept in step with `.wx-frame-in`. */
const FADE_MS = 700;
/** The weather is all there, then the step is solved. */
const DONE_MS = 900;
/** Below this the finger never really moved — a tap. */
const DRAG_THRESHOLD = 8;
/** A cloud pushed this far (% of the picture's width) goes. */
const PUSH_AWAY = 14;
/** A swipe this long (% of the width), more sideways than up or down, blows. */
const SWIPE = 22;
/** A shake: the finger turns back the other way by this much (% of the
    width), twice; the cloud follows it at most `SHAKE_REACH` sideways. */
const SHAKE_STEP = 3;
const SHAKE_REACH = 9;

/* The picture's width, capped by the height a step has, so it never pushes
   the page into a scroll (`--ratio` is its w/h). Phone and tablet: over the
   word; desktop: beside it. */
const SCENE_SIZE =
  "max-w-[min(100%,calc((100svh-26rem-min(2.5rem,4svh))*var(--ratio)))] sm:max-w-[min(30rem,calc((100svh-44rem)*var(--ratio)))] lg:max-w-[min(36rem,calc((var(--stage-h)-2rem)*var(--ratio)))]";

/** The sun's light under its clouds — dull, brighter as each one goes. */
const SUNLIGHT = ["brightness(0.86) saturate(0.55)", "brightness(0.91) saturate(0.7)", "brightness(0.96) saturate(0.85)", "none"];

/* Where each bit of weather starts and when (s) — fixed, never random: this
   renders on the server too. Rain and snow: across the cloud (0–1); a gust:
   which bit, how far down (% of the picture); sparkles: round the sun (% of
   the width from its middle). */
const FALL = [[0.08, 0], [0.5, 0.45], [0.28, 0.15], [0.7, 0.6], [0.9, 0.3], [0.18, 0.75], [0.4, 0.9], [0.62, 0.35], [0.82, 0.05], [0.12, 0.55], [0.34, 0.2], [0.56, 0.7], [0.76, 0.5], [0.95, 0.85], [0.22, 0.1], [0.46, 0.4], [0.66, 0.95], [0.86, 0.25]] as const;
const GUST = [[0, 22, 0], [1, 34, 0.12], [0, 46, 0.22], [2, 40, 0.3], [1, 56, 0.4], [0, 62, 0.5]] as const;
const SHINE = [[-22, -6, 0], [20, -10, 0.3], [-14, 14, 0.6], [24, 12, 0.9], [0, -20, 1.2], [-26, 4, 0.45], [12, 22, 0.75], [28, -2, 1.05]] as const;
/** How many drops (flakes) fall after each go. */
const PER_GO = { tap: 6, shake: 5 } as const;

interface Drag {
  /** The cloud being pushed or shaken; -1 for a swipe across the sky. */
  index: number;
  x0: number;
  y0: number;
  dx: number;
  dy: number;
  moved: boolean;
  /* A shake: which way the finger last went, its furthest point that way
     (% of the width) and how often it turned back. A swipe: blown yet. */
  dir: number;
  peak: number;
  turns: number;
  blown: boolean;
  /** How far a shaken cloud follows the finger (% of the width). */
  shift: number;
}

interface MakeWeatherProps {
  /** The weather, in English. */
  word: Weather;
  gesture: Gesture;
  scene: WeatherScene;
  /** What to do, in the child's language — the controls' name for a
      screen reader. */
  label: string;
  onSolved: () => void;
}

/**
 * Make the weather by hand, in three goes, on Bloo's hill — each weather
 * with its own gesture (direct request 2026-10-08): tap the cloud and it
 * rains, harder each time, the puddles growing; push the three clouds off
 * the sun and the hill brightens; swipe across the sky and the wind blows
 * — the tree bends, the leaves and the kite go up; shake the cloud and it
 * snows until the hill is white and a snowman stands on it. A tap does the
 * go too (nobody gets stuck); the task button's demo shows the gesture.
 * Nothing can go wrong — the weather is the lesson.
 *
 * The hill is a frame per go, the newest fading in over the last (the sun
 * has one, dulled under its clouds); what is in the sky lies over it on
 * layers of its own, the same size, so a cloud can be moved; the weather's
 * bits are its own pictures, falling or sweeping by CSS.
 */
export function MakeWeather({ word, gesture, scene, label, onSolved }: MakeWeatherProps) {
  const { frames, sky, bits } = scene;
  const [done, setDone] = useState(0);
  const [fading, setFading] = useState(false);
  const [gone, setGone] = useState<number[]>([]);
  const [gust, setGust] = useState({ n: 0, dir: 1 });
  const [drag, setDrag] = useState<Drag | null>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const cloudRefs = useRef<(HTMLSpanElement | null)[]>([]);
  /* What a gesture reads — gestures outrun renders. */
  const goes = useRef(0);
  const busy = useRef(false);
  /* A drag ends in a click on the same control — that click is not a tap. */
  const dragged = useRef(false);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);
  const after = (ms: number, run: () => void) => {
    timers.current.push(window.setTimeout(run, ms));
  };

  const full = done >= GOES;
  const ratio = frames[0].width / frames[0].height;
  const shown = Math.min(done, frames.length - 1);
  const [cl, ct, cw, ch] = sky[0].box;
  const widthPx = () => sceneRef.current?.getBoundingClientRect().width ?? 1;

  /** One go: the weather comes on a step. False while the last one is
      still coming. */
  const go = () => {
    if (busy.current || goes.current >= GOES) return false;
    busy.current = true;
    goes.current += 1;
    setDone(goes.current);
    setFading(true);
    after(FADE_MS, () => {
      setFading(false);
      busy.current = false;
      if (goes.current < GOES) return;
      void playCue(lessonCue.word(word));
      after(DONE_MS, onSolved);
    });
    return true;
  };

  /* Rain: the cloud squashes and it rains harder. */
  const squash = () => {
    if (!go()) return;
    cloudRefs.current[0]?.animate([{ scale: "1 1" }, { scale: "1.06 0.9" }, { scale: "0.97 1.05" }, { scale: "1 1" }], { duration: 420, easing: "ease-out" });
  };

  /* Snow, by a tap: the cloud shakes itself. */
  const wiggle = () => {
    if (!go()) return;
    cloudRefs.current[0]?.animate(
      [{ translate: "0 0" }, { translate: "-4% 0" }, { translate: "4% 0" }, { translate: "-3% 0" }, { translate: "3% 0" }, { translate: "0 0" }],
      { duration: 520, easing: "ease-in-out" },
    );
  };

  /* Wind: a gust sweeps across, the way the finger went. */
  const blow = (dir: number) => {
    if (!go()) return;
    setGust((last) => ({ n: last.n + 1, dir }));
    cloudRefs.current[0]?.animate([{ scale: "1" }, { scale: "1.08" }, { scale: "1" }], { duration: 500, easing: "ease-out" });
  };

  /* Sun: cloud `i` flies off the way it was pushed (from where the finger
     left it), and the hill brightens. */
  const pushAway = (i: number, dx: number, dy: number) => {
    const layer = cloudRefs.current[i];
    if (!go()) {
      layer?.animate([{ translate: `${dx}px ${dy}px` }, { translate: "0px 0px" }], { duration: 260, easing: "ease-out" });
      return;
    }
    const far = (widthPx() * 1.2) / Math.max(1, Math.hypot(dx, dy));
    layer?.animate(
      [
        { translate: `${dx}px ${dy}px`, opacity: 1 },
        { translate: `${dx * far}px ${dy * far}px`, opacity: 0 },
      ],
      { duration: 650, easing: "ease-in", fill: "forwards" },
    );
    setGone((last) => [...last, i]);
  };

  /* ---- The finger: on a cloud (push, shake) or across the sky (swipe) ---- */
  const onPointerDown = (index: number) => (event: ReactPointerEvent<HTMLElement>) => {
    dragged.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ index, x0: event.clientX, y0: event.clientY, dx: 0, dy: 0, moved: false, dir: 0, peak: 0, turns: 0, blown: false, shift: 0 });
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (!drag) return;
    const dx = event.clientX - drag.x0;
    const dy = event.clientY - drag.y0;
    const next = { ...drag, dx, dy, moved: drag.moved || Math.hypot(dx, dy) > DRAG_THRESHOLD };
    const pct = (dx / widthPx()) * 100;
    next.shift = Math.max(-SHAKE_REACH, Math.min(SHAKE_REACH, pct));
    if (gesture === "shake") {
      /* Each time the finger turns back the other way; two turns shake. */
      if (next.dir === 0) {
        if (Math.abs(pct) > SHAKE_STEP) Object.assign(next, { dir: Math.sign(pct), peak: pct });
      } else if ((pct - next.peak) * next.dir > 0) {
        next.peak = pct;
      } else if (Math.abs(pct - next.peak) > SHAKE_STEP) {
        Object.assign(next, { dir: -next.dir, peak: pct, turns: next.turns + 1 });
      }
      if (next.turns >= 2 && go()) next.turns = 0;
    }
    if (gesture === "swipe" && !next.blown && Math.abs(pct) >= SWIPE && Math.abs(dx) > 1.5 * Math.abs(dy)) {
      next.blown = true;
      blow(Math.sign(dx));
    }
    setDrag(next);
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLElement>) => {
    if (!drag) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    const { index, dx, dy, moved } = drag;
    setDrag(null);
    /* A tap: the click that follows takes it (a swipe surface has none). */
    if (!moved) {
      if (gesture === "swipe") blow(1);
      return;
    }
    dragged.current = true;
    window.setTimeout(() => (dragged.current = false), 0);
    /* A push far enough sends the cloud off; anything shorter lets it
       slide back (its layer's transition). */
    if (gesture === "push" && (Math.hypot(dx, dy) / widthPx()) * 100 >= PUSH_AWAY) pushAway(index, dx, dy);
  };

  /* A tap on a control (or Enter, with a keyboard). */
  const press = (index: number) => () => {
    if (dragged.current) return;
    if (gesture === "tap") squash();
    else if (gesture === "shake") wiggle();
    else if (gesture === "swipe") blow(1);
    else {
      const [l, , w] = sky[index].box;
      pushAway(index, (l + w / 2 < 50 ? -1 : 1) * 30, -8);
    }
  };

  /* Where a cloud is, while the finger has it. */
  const held = (i: number): CSSProperties | undefined => {
    if (!drag || drag.index !== i || !drag.moved) return undefined;
    if (gesture === "push") return { translate: `${drag.dx}px ${drag.dy}px` };
    if (gesture === "shake") return { translate: `${drag.shift}% 0` };
    return undefined;
  };

  const falling = gesture === "tap" || gesture === "shake";
  const fallCount = falling ? Math.min(FALL.length, done * PER_GO[gesture]) : 0;
  /* How far a drop falls: from under the cloud to the hill (cqi). */
  const fall = (88 - (ct + ch * 0.72)) / ratio;
  /* The sun's middle: under its clouds. */
  const sunAt = sky.reduce(([x, y], { box: [l, t, w, h] }) => [x + (l + w / 2) / sky.length, y + (t + h / 2) / sky.length], [0, 0]);

  return (
    <div className="card card-clay-white card-bare-lg flex w-full max-w-2xl flex-col items-center gap-3 px-3 py-4 sm:gap-5 sm:px-8 sm:py-6 lg:max-w-4xl lg:flex-row lg:justify-center lg:gap-12 lg:py-2 [@media(max-height:700px)]:gap-2 [@media(max-height:700px)]:py-3">
      <div ref={sceneRef} className={`relative w-full [container-type:inline-size] ${SCENE_SIZE}`} style={{ aspectRatio: ratio, "--ratio": ratio } as CSSProperties}>
        {/* Its shadow on the card — the render has none. */}
        <span aria-hidden className="absolute inset-x-[10%] -bottom-[2%] h-[12%] rounded-[50%] bg-[radial-gradient(closest-side,rgb(var(--shadow-hue)/0.28),transparent)]" />
        {frames.map((frame, k) => (
          <Image
            key={k}
            src={frame}
            alt=""
            fill
            loading="eager"
            sizes="(min-width: 1024px) 36rem, (min-width: 640px) 30rem, 92vw"
            draggable={false}
            className={`pointer-events-none select-none object-contain ${k === shown || (fading && k === shown - 1) ? "" : "invisible"} ${fading && k === shown && k > 0 ? "wx-frame-in" : ""}`}
            style={frames.length === 1 ? { filter: SUNLIGHT[done], transition: "filter 0.8s ease" } : undefined}
          />
        ))}

        {/* Rain or snow, from under the cloud — more with every go. */}
        {FALL.slice(0, fallCount).map(([u, delay], i) => (
          <span
            key={i}
            aria-hidden
            className={`pointer-events-none absolute z-[1] block ${gesture === "tap" ? "wx-rain w-[3.4cqi]" : "wx-snow w-[5cqi]"}`}
            style={{ left: `${cl + cw * (0.1 + 0.8 * u)}%`, top: `${ct + ch * 0.72}%`, aspectRatio: bits[0].width / bits[0].height, animationDelay: `${delay}s`, "--fall": `${fall}cqi` } as CSSProperties}
          >
            <Image src={bits[0]} alt="" fill sizes="3rem" className="object-contain" />
          </span>
        ))}

        {/* A gust, the way the finger went — and, once the wind is there, a
            breeze that keeps blowing. */}
        {gesture === "swipe" &&
          [gust.n > 0 && !full ? "gust" : null, full ? "breeze" : null].map(
            (kind) =>
              kind && (
                <span key={`${kind}-${gust.n}`} aria-hidden className="pointer-events-none absolute inset-0 z-[1]">
                  {GUST.map(([b, top, delay], i) => (
                    <span
                      key={i}
                      className={`absolute block ${kind === "gust" ? "wx-gust" : "wx-breeze"} ${b === 0 ? "w-[16cqi]" : "w-[7cqi]"}`}
                      style={{ top: `${top}%`, left: gust.dir > 0 ? "-18%" : "100%", aspectRatio: bits[b].width / bits[b].height, animationDelay: `${kind === "gust" ? delay : delay * 4}s`, "--dir": gust.dir } as CSSProperties}
                    >
                      <Image src={bits[b]} alt="" fill sizes="5rem" className={`object-contain ${gust.dir < 0 ? "-scale-x-100" : ""}`} />
                    </span>
                  ))}
                </span>
              ),
          )}

        {/* What is in the sky: the cloud, or the clouds over the sun. */}
        {sky.map(({ src, box: [l, t, w, h] }, i) => (
          <span
            key={i}
            ref={(el) => {
              cloudRefs.current[i] = el;
            }}
            className={`pointer-events-none absolute inset-0 z-[2] block ${drag?.index === i ? "" : "transition-[translate] duration-300 ease-out"}`}
            style={{ transformOrigin: `${l + w / 2}% ${t + h / 2}%`, ...held(i) }}
          >
            <Image src={src} alt="" fill loading="eager" sizes="(min-width: 1024px) 36rem, (min-width: 640px) 30rem, 92vw" draggable={false} className="select-none object-contain" />
          </span>
        ))}

        {/* The sun out: it sparkles. */}
        {gesture === "push" &&
          full &&
          SHINE.map(([x, y, delay], i) => (
            <span
              key={i}
              aria-hidden
              className="wx-twinkle pointer-events-none absolute z-[3] block h-[6cqi] w-[6cqi]"
              style={{ left: `${sunAt[0] + x}%`, top: `${sunAt[1] + y}%`, animationDelay: `${delay}s` }}
            >
              <Image src={bits[0]} alt="" fill sizes="2.5rem" className="object-contain" />
            </span>
          ))}

        {/* The wind's: a swipe anywhere on the picture. */}
        {gesture === "swipe" && !full && (
          <div aria-hidden className="absolute inset-0 z-[4] touch-none" onPointerDown={onPointerDown(-1)} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={() => setDrag(null)} />
        )}

        {/* The clouds to tap, shake or push — for a swipe, only a keyboard's
            way in (a finger swipes the picture under it). */}
        {!full &&
          sky.map(({ box }, i) =>
            gone.includes(i) ? null : (
              <button
                key={i}
                type="button"
                aria-label={label}
                onClick={press(i)}
                onPointerDown={gesture === "swipe" ? undefined : onPointerDown(i)}
                onPointerMove={gesture === "swipe" ? undefined : onPointerMove}
                onPointerUp={gesture === "swipe" ? undefined : onPointerUp}
                onPointerCancel={() => setDrag(null)}
                className={`absolute z-[5] block touch-none rounded-[40%] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[var(--page-accent-color)] ${gesture === "swipe" ? "pointer-events-none" : "cursor-grab"}`}
                style={place(box)}
              >
                {/* Until the first go, the first cloud glows. */}
                <span className={`block h-full w-full rounded-[40%] ${done === 0 && i === 0 ? "guide-target" : ""}`} />
              </button>
            ),
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
