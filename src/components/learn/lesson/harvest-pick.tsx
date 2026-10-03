"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import { Celebration } from "@/components/ui/celebration";
import { format } from "@/lib/format-dict";
import { lessonCue, playCue } from "@/lib/cue";
import type { Garden, SceneRect } from "@/types/course";
import { CueButton } from "./cue-button";
import { place } from "./find-shapes";

/** How long a food takes from its branch (its bed) into the basket… */
const FLY_MS = 760;
/** …the first part of it coming off — pulled up out of a bed. */
const OFF = 0.3;
/** A tap area is never smaller than this (% of the garden's width and
    height): on a small phone the garden is under 300px wide. Neighbours of
    one kind may overlap — any one of them is as good. */
const MIN_HIT = [13, 21] as const;
/** Two misses and a food the note still wants starts to glow. */
const HINT_AFTER = 2;
/** Where each picked one lies in the basket, by its turn: across the
    mouth and down it (fractions of the mouth), and how it is turned (°).
    The last three lie behind the first three. */
const PILE = [
  { x: 0.28, y: 0.82, turn: -10 },
  { x: 0.5, y: 0.92, turn: 6 },
  { x: 0.72, y: 0.8, turn: 12 },
  { x: 0.36, y: 0.36, turn: -6 },
  { x: 0.62, y: 0.32, turn: 8 },
  { x: 0.18, y: 0.4, turn: 12 },
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

/** Where the `slot`th one picked lies in the basket (% of the garden): at
    most a third of the mouth wide, and half of it tall for a tall food. */
function pileBox(garden: Garden, food: string, slot: number): SceneRect {
  const [left, top, width, height] = garden.basket;
  const picture = garden.foods[food];
  const aspect = picture.width / picture.height;
  /* How tall the garden is for its width: a % of its height in % of its width. */
  const tall = garden.ground.height / garden.ground.width;
  const k = Math.min(0.5, 0.34 / aspect);
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
 * by side (an apple tree, a banana plant, an orange tree), ONE basket, and
 * the note: "3 apples · 2 oranges · 1 banana" — never in the plants' order,
 * and every plant has more than the note asks for, so the child has to
 * read each word AND count. Tap one
 * and it comes off (out of the soil), flies into the basket and lies
 * there, its word popping up where it was, a socket on its line filling.
 * One too many wiggles on its branch — that line is done (ticked); two
 * misses and a food still wanted glows. Every line full → confetti.
 *
 * The garden is one render (`data/garden.ts`), laid in layers: the garden,
 * its foods, what stands in front of them (a bed's near half, the basket),
 * what is in the basket, the basket's rim over it. A food comes off behind
 * the front and flies over everything, landing where its picture in the
 * basket then appears.
 */
export function HarvestPick({ order, garden, itemAria, hearLabel, onSolved, onMiss }: HarvestPickProps) {
  /* Tapped, in order — each one's place in the basket — and landed. */
  const [taken, setTaken] = useState<number[]>([]);
  const [landed, setLanded] = useState<number[]>([]);
  const [shake, setShake] = useState<{ index: number; n: number } | null>(null);
  const [misses, setMisses] = useState(0);
  const picked = useRef<number[]>([]);
  const sceneRef = useRef<HTMLDivElement>(null);
  const foodRefs = useRef(new Map<number, HTMLSpanElement>());
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);

  const { items } = garden;
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

  /** Off the branch (out of the bed) and into the basket. Worked out in
      pixels so it ends exactly on its picture in the basket: the food
      turns and grows about its stem, so the stem is what is moved. */
  const fly = (i: number, slot: number) => {
    const food = foodRefs.current.get(i);
    const scene = sceneRef.current?.getBoundingClientRect();
    if (!food || !scene) return;
    const { box, hit, tilt, food: kind } = items[i];
    const [left, top, width, height] = box;
    const [pl, pt, pw, ph] = pileBox(garden, kind, slot);
    const scale = pw / width;
    const turn = (PILE[slot].turn * Math.PI) / 180;
    const half = (scale * (scene.height * height)) / 200;
    const tx = (scene.width * (pl + pw / 2 - (left + width / 2))) / 100 + half * Math.sin(turn);
    const ty = (scene.height * (pt + ph / 2 - top)) / 100 - half * Math.cos(turn);
    /* Up by what of it is hidden (in the soil), and a little more. */
    const up = (scene.height * (height - hit[3] + height * 0.08)) / 100;
    food.animate(
      [
        { translate: "0px 0px", rotate: `${tilt}deg`, scale: "1", zIndex: 1 },
        { translate: `0px ${-up}px`, rotate: `${tilt}deg`, scale: "1.06", zIndex: 1, offset: OFF },
        { translate: `0px ${-up}px`, rotate: `${tilt}deg`, scale: "1.06", zIndex: 6, offset: OFF + 0.01 },
        { translate: `${tx}px ${ty}px`, rotate: `${PILE[slot].turn}deg`, scale: String(scale), zIndex: 6 },
      ],
      { duration: FLY_MS, easing: "cubic-bezier(0.45, 0, 0.55, 1)", fill: "forwards" },
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

  const sizes = (width: number) => `(min-width: 1024px) ${Math.ceil(width * 0.4)}rem, (min-width: 640px) ${Math.ceil(width * 0.44)}rem, ${Math.ceil(width * 0.92)}vw`;

  return (
    /* Phone and tablet: the note across the top, the garden under it.
       Desktop: the note on the left, the garden on the right. */
    <div className="flex w-full max-w-3xl flex-col items-center gap-3 sm:gap-5 lg:max-w-none lg:flex-row lg:justify-center lg:gap-10">
      {/* Nova's note — English, so it reads left to right in every
          language. On a phone and a tablet its lines stand side by side,
          each under its speaker; on a desktop a list. */}
      <ol dir="ltr" className="card card-clay-white -rotate-1 grid w-full shrink-0 grid-cols-3 gap-1 p-2 sm:max-w-xl sm:gap-3 sm:p-3 lg:flex lg:w-64 lg:flex-col lg:gap-2 lg:p-4">
        {order.map((line) => {
          const text = lineOf(line);
          const have = countOf(landed, line.word);
          const done = have === line.count;
          return (
            <li key={line.word} className="relative flex flex-col items-center gap-1 rounded-2xl px-1 py-1 lg:flex-row lg:gap-3 lg:px-2 [@media(max-height:700px)]:gap-0.5 [@media(max-height:700px)]:py-0">
              <CueButton cue={lessonCue.sentence(text)} label={format(hearLabel, { word: text })} size="sm" />
              <span className="flex flex-col items-center gap-1 lg:items-start [@media(max-height:700px)]:gap-0.5">
                <span className={`whitespace-nowrap text-xl font-bold text-[var(--color-ink)] sm:text-2xl ${done ? "opacity-45 line-through decoration-[3px]" : ""}`}>
                  {text}
                </span>
                {/* One socket per one to pick, filling as each lands.
                    `.letter-slot` sets its own radius, unlayered — the
                    round one comes inline. */}
                <span className="flex items-center gap-1">
                  {Array.from({ length: line.count }, (_, k) => (
                    <span key={k} className="letter-slot h-6 w-6 sm:h-7 sm:w-7" style={{ borderRadius: "999px" }}>
                      {k < have && (
                        <span className="anim-pop-in absolute inset-0.5">
                          <Image src={garden.foods[line.word]} alt="" fill sizes="28px" className="object-contain" />
                        </span>
                      )}
                    </span>
                  ))}
                </span>
              </span>
              {done && (
                <span className="clay anim-pop-in absolute -top-1 right-0 flex h-7 w-7 items-center justify-center rounded-full text-white lg:top-1/2 lg:-mt-3.5" style={GO}>
                  <Check className="h-4 w-4" strokeWidth={3.5} />
                </span>
              )}
            </li>
          );
        })}
      </ol>

      <div className="card card-clay-white card-bare-lg relative w-full max-w-[min(100%,calc((100svh-31.5rem)*1.5+1rem))] p-2 sm:max-w-[min(100%,calc((100svh-47.5rem)*1.5+1.5rem))] sm:p-3 lg:w-[min(40rem,calc(var(--stage-h)*1.5))] lg:max-w-none lg:p-0">
        <div
          ref={sceneRef}
          className="relative w-full overflow-hidden rounded-[1.35rem] lg:shadow-[0_20px_44px_-18px_rgb(var(--shadow-hue)/0.34)]"
          style={{ aspectRatio: `${garden.ground.width} / ${garden.ground.height}` }}
        >
          <Image src={garden.ground} alt="" fill preload sizes={sizes(100)} className="select-none object-cover" />

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

          <span className="pointer-events-none absolute z-[2]" style={place(garden.front.box)}>
            <Image src={garden.front.src} alt="" fill loading="eager" sizes={sizes(garden.front.box[2])} className="select-none" />
          </span>

          {/* What is in the basket — the back ones first, under the front ones. */}
          {BACK_FIRST.map((slot) => {
            const i = taken[slot];
            if (i === undefined || !landed.includes(i)) return null;
            return (
              <span
                key={slot}
                className="pointer-events-none absolute z-[3]"
                style={{ ...place(pileBox(garden, items[i].food, slot)), rotate: `${PILE[slot].turn}deg` }}
              >
                <Image src={garden.foods[items[i].food]} alt="" fill sizes={sizes(items[i].box[2])} className="select-none object-contain" />
              </span>
            );
          })}

          <span className="pointer-events-none absolute z-[4]" style={place(garden.rim.box)}>
            <Image src={garden.rim.src} alt="" fill loading="eager" sizes={sizes(garden.rim.box[2])} className="select-none" />
          </span>

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
