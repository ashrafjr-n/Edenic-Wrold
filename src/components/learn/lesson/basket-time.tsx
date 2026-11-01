"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import Image, { type StaticImageData } from "next/image";
import { Celebration } from "@/components/ui/celebration";
import { lessonCue, playCue } from "@/lib/cue";
import { shuffle } from "@/lib/seeded";
import type { Basket, Food, SceneRect } from "@/types/course";
import { ClayWord, PLAIN_TONE } from "./clay-word";
import { place } from "./find-shapes";

/** Over the basket, then down into it. */
const FLY_MS = 620;
/** It lands, the basket bounces, then the step is solved. */
const DONE_MS = 1500;
/** A wrong one shakes this long, then goes home and greys. */
const MISS_MS = 480;
/** Below this the finger never really moved — a tap, not a drag. */
const DRAG_THRESHOLD = 8;
/** A finger let go this close (px) to the basket still drops it in. */
const REACH = 18;

/* The height a step has, `--room` (as Feed the animal has it): the word,
   the basket and the paper of vegetables share it. */
const ROOM =
  "[--room:calc(100svh-21rem-min(2.5rem,4svh))] sm:[--room:calc(100svh-38rem)] lg:[--room:calc(var(--stage-h)-1.5rem)]";
const SIZES = {
  "--food": "min(calc((100cqi - 3 * var(--gap) - 1.5rem) / 4), calc(var(--room) * 0.22), 7.5rem)",
} as CSSProperties;

/** Where the vegetable lies in the basket (% of the basket picture): in
    the middle of its mouth, its lower part under the rim. */
function inBasket(basket: Basket, picture: StaticImageData): SceneRect {
  const [left, top, width, height] = basket.mouth;
  const aspect = picture.width / picture.height;
  const tall = basket.src.height / basket.src.width;
  const k = Math.min(0.62, 0.48 / aspect);
  const h = (k * width) / tall;
  const w = aspect * k * width;
  return [left + width / 2 - w / 2, top + height * 0.82 - h, w, h];
}

interface Drag {
  index: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  moved: boolean;
}

interface BasketTimeProps {
  /** The lesson's vegetable, in English — written over the basket. */
  word: string;
  /** Its own picture first, then three others. */
  foods: readonly Food[];
  basket: Basket;
  seed: string;
  onSolved: () => void;
  onMiss: () => void;
}

/**
 * Basket Time (Nova's Vegetables, the user's design, 2026-11-01): the word
 * on a paper over Nova's basket, and four vegetables under it — the
 * lesson's and three others. Read the word, then drag its vegetable into
 * the basket, or tap it. It flies up over the basket and drops in, under
 * the rim; the basket bounces, the word is said, confetti. A wrong one
 * shakes, goes home and greys.
 */
export function BasketTime({ word, foods, basket, seed, onSolved, onMiss }: BasketTimeProps) {
  const order = useMemo(() => shuffle(foods.map((_, i) => i), `${seed}:basket`), [foods, seed]);
  const [refused, setRefused] = useState<number[]>([]);
  const [shaking, setShaking] = useState<number | null>(null);
  const [landed, setLanded] = useState(false);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [aim, setAim] = useState(false);
  const basketRef = useRef<HTMLDivElement>(null);
  const foodRefs = useRef<(HTMLSpanElement | null)[]>([]);
  /* What a tap reads — taps outrun renders. */
  const busy = useRef(false);
  /* A drag ends in a click on the same vegetable — that click is not a tap. */
  const dragged = useRef(false);
  const timers = useRef<number[]>([]);
  const spot = inBasket(basket, foods[0].src);

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);
  const after = (ms: number, run: () => void) => {
    timers.current.push(window.setTimeout(run, ms));
  };
  const still = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const overBasket = (x: number, y: number) => {
    const box = basketRef.current?.getBoundingClientRect();
    return Boolean(box && x > box.left - REACH && x < box.right + REACH && y > box.top - REACH && y < box.bottom + REACH);
  };

  const springBack = (index: number, dx: number, dy: number) =>
    foodRefs.current[index]?.animate([{ translate: `${dx}px ${dy}px` }, { translate: "0px 0px" }], { duration: still() ? 1 : 300, easing: "cubic-bezier(0.3, 1.4, 0.5, 1)" });

  /** Vegetable `index` put in the basket: a tap on it, or a drop `offset`
      away from where it lay. */
  const put = (index: number, offset = { dx: 0, dy: 0 }) => {
    if (busy.current || refused.includes(index)) return;
    busy.current = true;
    setAim(false);
    if (index !== 0) {
      setShaking(index);
      navigator.vibrate?.(30);
      onMiss();
      springBack(index, offset.dx, offset.dy);
      after(MISS_MS, () => {
        setShaking(null);
        setRefused((list) => [...list, index]);
        busy.current = false;
      });
      return;
    }
    const food = foodRefs.current[index];
    const bin = basketRef.current;
    if (food && bin) {
      /* Worked out from where it lies, so it ends exactly on its place in
         the basket — and at that place's size. */
      const from = food.getBoundingClientRect();
      const to = bin.getBoundingClientRect();
      const [l, t, w, h] = spot;
      const cx = to.left + (to.width * (l + w / 2)) / 100;
      const cy = to.top + (to.height * (t + h / 2)) / 100;
      const x = cx - (from.left + from.width / 2 - offset.dx);
      const y = cy - (from.top + from.height / 2 - offset.dy);
      const above = to.top - (from.top + from.height / 2 - offset.dy) - to.height * 0.15;
      const scale = (to.width * w) / 100 / from.width;
      food.animate(
        [
          { translate: `${offset.dx}px ${offset.dy}px`, scale: "1.1" },
          { translate: `${x}px ${Math.min(above, y)}px`, scale: String(scale * 1.1), offset: 0.6 },
          { translate: `${x}px ${y}px`, scale: String(scale) },
        ],
        { duration: still() ? 1 : FLY_MS, easing: "cubic-bezier(0.45, 0, 0.4, 1)", fill: "forwards" },
      );
    }
    after(still() ? 0 : FLY_MS, () => {
      setLanded(true);
      navigator.vibrate?.([10, 40, 14]);
      after(250, () => void playCue(lessonCue.word(word)));
      after(DONE_MS, onSolved);
    });
  };

  /* ---- Dragging a vegetable; a real drag ends on the basket or goes home ---- */
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
    const moved = drag.moved || Math.hypot(dx, dy) > DRAG_THRESHOLD;
    setDrag({ ...drag, dx, dy, moved });
    if (moved) setAim(overBasket(event.clientX, event.clientY));
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!drag) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    const { index, dx, dy, moved } = drag;
    setDrag(null);
    /* A tap: the click that follows takes it. */
    if (!moved) return;
    dragged.current = true;
    window.setTimeout(() => (dragged.current = false), 0);
    if (overBasket(event.clientX, event.clientY)) put(index, { dx, dy });
    else {
      setAim(false);
      springBack(index, dx, dy);
    }
  };

  const basketSizes = "(min-width: 1024px) 16rem, 45vw";

  return (
    <div className={`card card-clay-white card-bare-lg relative w-full max-w-2xl px-2 py-3 [container-type:inline-size] sm:px-6 lg:max-w-3xl ${ROOM}`}>
      <div className="flex flex-col items-center gap-[min(1.5rem,calc(var(--room)*0.05))] [--gap:0.5rem] sm:[--gap:1rem]" style={SIZES}>
        {/* English in every locale; one quiet ink — it is read, not matched. */}
        <div dir="ltr" className={landed ? "anim-jump" : ""}>
          <ClayWord word={word} size="sm" tone={PLAIN_TONE} />
        </div>

        {/* Nova's basket: what goes in lies under its near half. */}
        <div
          ref={basketRef}
          className={`basket-bin relative h-[min(17rem,calc(var(--room)*0.5-2.6rem))] ${aim ? "basket-bin--aim" : ""} ${landed ? "basket-bin--in" : ""}`}
          style={{ aspectRatio: `${basket.src.width} / ${basket.src.height}` }}
        >
          <span aria-hidden className="absolute inset-x-[10%] -bottom-[5%] h-[16%] rounded-[50%] bg-[radial-gradient(closest-side,rgb(0_0_0/0.3),transparent)]" />
          <Image src={basket.src} alt="" fill preload sizes={basketSizes} className="select-none object-contain" />
          {landed && (
            <span className="pointer-events-none absolute z-[3]" style={place(spot)}>
              <Image src={foods[0].src} alt="" fill sizes="8rem" className="select-none object-contain" />
            </span>
          )}
          <span className="pointer-events-none absolute inset-0 z-[4]">
            <Image src={basket.rim} alt="" fill preload sizes={basketSizes} className="select-none object-contain" />
          </span>
        </div>

        {/* The vegetables, on a paper on the board. */}
        <div className="card card-clay-white pic-card grid grid-cols-[repeat(4,var(--food))] gap-[var(--gap)] p-3">
          {order.map((index) => {
            const { word: name, src } = foods[index];
            const off = refused.includes(index);
            const gone = landed && index === 0;
            const held = drag?.index === index && drag.moved ? drag : null;
            return (
              <button
                key={name}
                type="button"
                aria-label={name}
                disabled={off || landed}
                onClick={() => {
                  if (!dragged.current) put(index);
                }}
                onPointerDown={onPointerDown(index)}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={() => setDrag(null)}
                /* `touch-action: none` or a drag scrolls the page instead. */
                className={`relative block h-[var(--food)] w-[var(--food)] touch-none select-none rounded-[22%] transition-[filter,opacity] duration-300 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[var(--chalk-accent)] ${
                  held ? "z-20 cursor-grabbing" : "cursor-grab"
                } ${off ? "brightness-[0.8] saturate-0" : ""} ${landed && !gone ? "opacity-40" : ""} ${shaking === index ? "anim-wiggle" : ""}`}
              >
                <span
                  ref={(el) => {
                    foodRefs.current[index] = el;
                  }}
                  className={`feed-food pointer-events-none relative block h-full w-full ${held ? "feed-food--held" : ""} ${gone ? "opacity-0" : ""}`}
                  style={held ? { translate: `${held.dx}px ${held.dy}px` } : undefined}
                >
                  <Image src={src} alt="" fill preload sizes="(min-width: 1024px) 7.5rem, 22vw" draggable={false} className="object-contain p-[8%]" />
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {landed && <Celebration />}
    </div>
  );
}
