"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import Image from "next/image";
import type { StaticImageData } from "next/image";
import { Check } from "lucide-react";
import { Celebration } from "@/components/ui/celebration";
import { format } from "@/lib/format-dict";
import { lessonCue, playCue } from "@/lib/cue";
import type { Basket, Garden, SceneRect } from "@/types/course";
import { CueButton } from "./cue-button";
import { place } from "./find-shapes";

/** How long a food takes from its branch (its bed) into the basket… */
const FLY_MS = 900;
/** …the first part of it coming off — pulled up out of a bed — and the
    last, dropping into the basket from over it. */
const OFF = 0.25;
const DROP = 0.75;
/** A tap area is never smaller than this (% of the garden's width and
    height): on a small phone the garden is under 300px wide. Neighbours of
    one kind may overlap — any one of them is as good. */
const MIN_HIT = [13, 21] as const;
/** Two misses and a food the note still wants starts to glow. */
const HINT_AFTER = 2;
/** Where each picked one lies in the basket, by its turn: across the
    mouth and how far down it its bottom is (fractions of the mouth — the
    front three sink behind the rim), and how it is turned (°). The last
    three lie behind the first three. */
const PILE = [
  { x: 0.3, y: 0.98, turn: -10 },
  { x: 0.52, y: 1.02, turn: 6 },
  { x: 0.74, y: 0.96, turn: 12 },
  { x: 0.4, y: 0.7, turn: -6 },
  { x: 0.64, y: 0.66, turn: 8 },
  { x: 0.2, y: 0.74, turn: 12 },
];
const BACK_FIRST = [5, 3, 4, 0, 1, 2];

const GO = { backgroundColor: "var(--color-go)", "--clay-edge": "var(--color-go-dark)" } as CSSProperties;

type Line = { word: string; things: string; count: number };

/** "3 apples", "1 banana" — the number and the word, its plural for more
    than one. English. */
export const lineOf = ({ word, things, count }: Line) => `${count} ${count === 1 ? word : things}`;

/** The tap area: the hit box, grown about its centre to the minimum. */
function tapArea([left, top, width, height]: SceneRect): SceneRect {
  const w = Math.max(width, MIN_HIT[0]);
  const h = Math.max(height, MIN_HIT[1]);
  return [left + (width - w) / 2, top + (height - h) / 2, w, h];
}

/** Where the `slot`th one picked lies in the basket (% of the basket): at
    most 0.3 of the mouth wide, and 0.4 of it tall for a tall food. */
function pileBox(basket: Basket, picture: StaticImageData, slot: number): SceneRect {
  const [left, top, width, height] = basket.mouth;
  const aspect = picture.width / picture.height;
  /* How tall the basket is for its width: a % of its height in % of its width. */
  const tall = basket.src.height / basket.src.width;
  const k = Math.min(0.4, 0.3 / aspect);
  const h = (k * width) / tall;
  const w = aspect * k * width;
  const { x, y } = PILE[slot];
  return [left + width * x - w / 2, top + height * y - h, w, h];
}

interface HarvestPickProps {
  /** Nova's note: each food, its plural and how many to pick. */
  order: Line[];
  garden: Garden;
  /** "Tap the {word}" — each food's name for a screen reader. */
  itemAria: string;
  /** "Hear {word}" — each line's speaker. */
  hearLabel: string;
  onSolved: () => void;
  onMiss: () => void;
}

/**
 * Pick what Nova's note says — the Fruits review's exam: three plants side
 * by side (an apple tree, a banana plant, an orange tree), the note — "3
 * apples · 2 oranges · 1 banana", never in the plants' order, and every
 * plant has more than the note asks for, so the child has to read each
 * word AND count — and Nova's basket beside the note, out on the page. Tap
 * one and it comes off (out of the soil), flies out of the garden over the
 * basket and drops into it, its word popping up where it was, a socket on
 * its line filling. One too many wiggles on its branch — that line is done
 * (its speaker turns into a tick); two misses and a food still wanted
 * glows. Every line full → confetti.
 *
 * The garden is one render (`data/garden.ts`), laid in layers: the garden,
 * its foods, what stands in front of them (the beds' near halves). The
 * basket is two: the basket, then what is in it, then its near half over
 * that. Nothing between them makes a stacking context, so a food in flight
 * goes over everything and drops in BETWEEN the basket and its rim, landing
 * where its picture in the basket then appears.
 */
export function HarvestPick({ order, garden, itemAria, hearLabel, onSolved, onMiss }: HarvestPickProps) {
  /* Tapped, in order — each one's place in the basket — and landed. */
  const [taken, setTaken] = useState<number[]>([]);
  const [landed, setLanded] = useState<number[]>([]);
  const [shake, setShake] = useState<{ index: number; n: number } | null>(null);
  const [misses, setMisses] = useState(0);
  const picked = useRef<number[]>([]);
  const sceneRef = useRef<HTMLDivElement>(null);
  const basketRef = useRef<HTMLDivElement>(null);
  const foodRefs = useRef(new Map<number, HTMLSpanElement>());
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);

  const { items, basket } = garden;
  const countOf = (list: number[], word: string) => list.filter((i) => items[i].food === word).length;
  /* The note still wants one more of it. */
  const wanted = (i: number, list: number[]) => {
    const line = order.find((l) => l.word === items[i].food);
    return line !== undefined && countOf(list, line.word) < line.count;
  };
  const solved = order.every((line) => countOf(landed, line.word) === line.count);
  const hinted = !solved && misses >= HINT_AFTER ? items.findIndex((_, i) => !taken.includes(i) && wanted(i, taken)) : -1;

  /* Reported once the last one is in — taps land faster than renders. */
  const reported = useRef(false);
  useEffect(() => {
    if (!solved || reported.current) return;
    reported.current = true;
    onSolved();
  }, [solved, onSolved]);

  /** Off the branch (out of the bed), over the basket and down into it.
      Worked out in pixels so it ends exactly on its picture in the basket:
      the food turns and grows about its stem, so the stem is what is
      moved. */
  const fly = (i: number, slot: number) => {
    const food = foodRefs.current.get(i);
    const scene = sceneRef.current?.getBoundingClientRect();
    const bin = basketRef.current?.getBoundingClientRect();
    if (!food || !scene || !bin) return;
    const { box, hit, tilt, food: kind } = items[i];
    const [left, top, width, height] = box;
    const [pl, pt, pw, ph] = pileBox(basket, garden.foods[kind], slot);
    const scale = (bin.width * pw) / (scene.width * width);
    const turn = (PILE[slot].turn * Math.PI) / 180;
    const half = (scale * (scene.height * height)) / 200;
    const tx = bin.left + (bin.width * (pl + pw / 2)) / 100 - (scene.left + (scene.width * (left + width / 2)) / 100) + half * Math.sin(turn);
    const ty = bin.top + (bin.height * (pt + ph / 2)) / 100 - (scene.top + (scene.height * top) / 100) - half * Math.cos(turn);
    /* Up by what of it is hidden (in the soil), and a little more. */
    const up = (scene.height * (height - hit[3] + height * 0.08)) / 100;
    /* Over the basket, clear of its rim, before it drops in. */
    const over = ty - bin.height * 0.55;
    const end = { rotate: `${PILE[slot].turn}deg`, scale: String(scale) };
    food.animate(
      [
        { translate: "0px 0px", rotate: `${tilt}deg`, scale: "1", zIndex: 1, easing: "ease-out" },
        { translate: `0px ${-up}px`, rotate: `${tilt}deg`, scale: "1.06", zIndex: 1, offset: OFF },
        { translate: `0px ${-up}px`, rotate: `${tilt}deg`, scale: "1.06", zIndex: 5, offset: OFF + 0.01, easing: "ease-in-out" },
        { translate: `${tx}px ${over}px`, ...end, zIndex: 5, offset: DROP },
        { translate: `${tx}px ${over}px`, ...end, zIndex: 3, offset: DROP + 0.01, easing: "ease-in" },
        { translate: `${tx}px ${ty}px`, ...end, zIndex: 3 },
      ],
      { duration: FLY_MS, fill: "forwards" },
    );
  };

  const pick = (i: number) => {
    if (picked.current.includes(i)) return;
    if (!wanted(i, picked.current)) {
      setShake((last) => ({ index: i, n: (last?.n ?? 0) + 1 }));
      setMisses((count) => count + 1);
      onMiss();
      return;
    }
    picked.current.push(i);
    const slot = picked.current.length - 1;
    setTaken([...picked.current]);
    setMisses(0);
    void playCue(lessonCue.word(items[i].food));
    fly(i, slot);
    timers.current.push(window.setTimeout(() => setLanded((all) => (all.includes(i) ? all : [...all, i])), FLY_MS));
  };

  const sizes = (width: number) => `(min-width: 1024px) ${Math.ceil(width * 0.38)}rem, (min-width: 640px) ${Math.ceil(width * 0.44)}rem, ${Math.ceil(width * 0.92)}vw`;
  const basketSizes = "(min-width: 1024px) 14rem, (min-width: 640px) 12rem, 9.5rem";

  return (
    /* Phone and tablet: Nova's note and her basket side by side, the garden
       under them. Desktop: the note over the basket, the garden beside
       them. `--ratio`: the garden's width for its height. */
    <div
      className="flex w-full max-w-3xl flex-col items-center gap-3 sm:gap-5 lg:max-w-none lg:flex-row lg:justify-center lg:gap-8"
      style={{ "--ratio": garden.ground.width / garden.ground.height } as CSSProperties}
    >
      <div className="flex w-full items-center justify-center gap-2 sm:gap-8 lg:w-auto lg:flex-col lg:gap-6">
        {/* Nova's note — English, so it reads left to right in every
            language: a line each, its speaker (a tick once it is full),
            the words and a socket per one to pick. */}
        <ol dir="ltr" className="card card-clay-white -rotate-1 grid shrink-0 grid-cols-[auto_auto_auto] items-center gap-x-1.5 gap-y-0.5 p-1.5 sm:gap-x-3 sm:gap-y-2 sm:p-3 lg:gap-x-2.5 lg:p-3.5">
          {order.map((line) => {
            const text = lineOf(line);
            const have = countOf(landed, line.word);
            const done = have === line.count;
            return (
              <li key={line.word} className="col-span-3 grid grid-cols-subgrid items-center">
                {done ? (
                  <span className="clay anim-pop-in flex h-11 w-11 items-center justify-center rounded-full text-white" style={GO}>
                    <Check className="h-5 w-5" strokeWidth={3.5} />
                  </span>
                ) : (
                  <CueButton cue={lessonCue.sentence(text)} label={format(hearLabel, { word: text })} size="sm" />
                )}
                <span className={`whitespace-nowrap text-lg font-bold text-[var(--color-ink)] sm:text-2xl ${done ? "opacity-45 line-through decoration-[3px]" : ""}`}>
                  {text}
                </span>
                {/* One socket per one to pick, filling as each lands.
                    `.letter-slot` sets its own radius, unlayered — the
                    round one comes inline. */}
                <span className="flex items-center gap-1">
                  {Array.from({ length: line.count }, (_, k) => (
                    <span key={k} className="letter-slot h-5 w-5 sm:h-7 sm:w-7" style={{ borderRadius: "999px" }}>
                      {k < have && (
                        <span className="anim-pop-in absolute inset-0.5">
                          <Image src={garden.foods[line.word]} alt="" fill sizes="28px" className="object-contain" />
                        </span>
                      )}
                    </span>
                  ))}
                </span>
              </li>
            );
          })}
        </ol>

        {/* Nova's basket, out on the page: what is picked lies in it (the
            back ones first), under its near half. Its shadow is the page's
            own, in the shadow hue. */}
        <div
          ref={basketRef}
          className="relative min-w-0 max-w-[9.5rem] flex-1 sm:w-48 sm:max-w-none sm:flex-none lg:w-[min(14rem,calc((var(--stage-h)-13rem)*var(--basket-ratio)))]"
          style={{ aspectRatio: `${basket.src.width} / ${basket.src.height}`, "--basket-ratio": basket.src.width / basket.src.height } as CSSProperties}
        >
          <span aria-hidden className="absolute inset-x-[10%] -bottom-[5%] h-[16%] rounded-[50%] bg-[radial-gradient(closest-side,rgb(var(--shadow-hue)/0.3),transparent)]" />
          <Image src={basket.src} alt="" fill preload sizes={basketSizes} className="select-none object-contain" />
          {BACK_FIRST.map((slot) => {
            const i = taken[slot];
            if (i === undefined || !landed.includes(i)) return null;
            return (
              <span
                key={slot}
                className="pointer-events-none absolute z-[3]"
                style={{ ...place(pileBox(basket, garden.foods[items[i].food], slot)), rotate: `${PILE[slot].turn}deg` }}
              >
                <Image src={garden.foods[items[i].food]} alt="" fill sizes="4rem" className="select-none object-contain" />
              </span>
            );
          })}
          <span className="pointer-events-none absolute inset-0 z-[4]">
            <Image src={basket.rim} alt="" fill preload sizes={basketSizes} className="select-none object-contain" />
          </span>
        </div>
      </div>

      <div className="card card-clay-white card-bare-lg relative w-full max-w-[min(100%,calc((100svh-33.125rem)*var(--ratio)+1rem))] p-2 sm:max-w-[min(100%,calc((100svh-48.625rem)*var(--ratio)+1.5rem))] sm:p-3 lg:w-[min(38rem,calc(var(--stage-h)*var(--ratio)))] lg:max-w-none lg:p-0">
        <div
          ref={sceneRef}
          className="relative w-full rounded-[1.35rem] lg:shadow-[0_20px_44px_-18px_rgb(var(--shadow-hue)/0.34)]"
          style={{ aspectRatio: `${garden.ground.width} / ${garden.ground.height}` }}
        >
          {/* Only the garden is clipped to the corners — a food flies out. */}
          <span className="absolute inset-0 overflow-hidden rounded-[1.35rem]">
            <Image src={garden.ground} alt="" fill preload sizes={sizes(100)} className="select-none object-cover" />
          </span>

          {items.map(({ food, box, tilt }, i) => {
            if (landed.includes(i)) return null;
            const isShaking = shake?.index === i;
            return (
              <span
                key={isShaking ? `${i}.${shake.n}` : i}
                ref={(el) => {
                  if (el) foodRefs.current.set(i, el);
                  else foodRefs.current.delete(i);
                }}
                className={`pointer-events-none absolute z-[1] ${isShaking ? "anim-wiggle" : ""}`}
                style={{ ...place(box), rotate: `${tilt}deg`, transformOrigin: "50% 0%" }}
              >
                <Image src={garden.foods[food]} alt="" fill loading="eager" sizes={sizes(box[2])} className="select-none object-contain" />
              </span>
            );
          })}

          {garden.front && (
            <span className="pointer-events-none absolute z-[2]" style={place(garden.front.box)}>
              <Image src={garden.front.src} alt="" fill loading="eager" sizes={sizes(garden.front.box[2])} className="select-none" />
            </span>
          )}

          {/* The glow on a food still wanted, after two misses. */}
          {hinted >= 0 && (
            <span className="pointer-events-none absolute z-[4]" style={place(items[hinted].hit)}>
              <span className="guide-target block h-full w-full" />
            </span>
          )}

          {items.map(({ food, hit }, i) =>
            taken.includes(i) ? null : (
              <button
                key={`tap-${i}`}
                type="button"
                aria-label={format(itemAria, { word: food })}
                onClick={() => pick(i)}
                className="absolute z-[5] rounded-[30%] focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]"
                style={place(tapArea(hit))}
              />
            ),
          )}

          {/* The word, where each one was picked. English: left to right. */}
          {taken.map((i) => {
            const [left, top, width] = items[i].hit;
            return (
              <span
                key={`word-${i}`}
                dir="ltr"
                aria-hidden
                className="harvest-word pointer-events-none absolute z-[7] whitespace-nowrap rounded-full bg-white px-3 py-1 text-lg font-bold text-[var(--color-ink-fixed)] shadow-[0_6px_14px_-6px_rgb(var(--shadow-hue)/0.55)] sm:text-xl lg:text-2xl"
                style={{ left: `${left + width / 2}%`, top: `${top}%` } as CSSProperties}
              >
                {items[i].food}
              </span>
            );
          })}

          {solved && <Celebration />}
        </div>
      </div>
    </div>
  );
}
