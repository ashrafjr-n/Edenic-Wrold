"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import Image from "next/image";
import { Celebration } from "@/components/ui/celebration";
import { format } from "@/lib/format-dict";
import { lessonCue, playCue } from "@/lib/cue";
import type { Garden, SceneRect } from "@/types/course";
import { ClayWord } from "./clay-word";
import { CueButton } from "./cue-button";
import { place, STAGE_CARD } from "./find-shapes";

/** How long a food takes from its branch (its bed) into the basket… */
const FLY_MS = 760;
/** …the first part of it coming off — pulled up out of a bed. */
const OFF = 0.3;
/** A tap area is never smaller than this (% of the garden): a carrot's
    top is thin, and on a small phone the garden is under 200px wide.
    Neighbours may overlap — any one of the five is right. */
const MIN_HIT = [21, 17] as const;
/** Where each picked one lies in the basket, by its turn: across the
    mouth and down it (fractions of the mouth), and how it is turned (°).
    The last two lie behind the first three. */
const PILE = [
  { x: 0.3, y: 0.8, turn: -10 },
  { x: 0.52, y: 0.9, turn: 6 },
  { x: 0.73, y: 0.78, turn: 12 },
  { x: 0.41, y: 0.35, turn: -6 },
  { x: 0.63, y: 0.32, turn: 8 },
];
const BACK_FIRST = [3, 4, 0, 1, 2];

/** The tap area: the hit box, grown about its centre to the minimum. */
function tapArea([left, top, width, height]: SceneRect): SceneRect {
  const w = Math.max(width, MIN_HIT[0]);
  const h = Math.max(height, MIN_HIT[1]);
  return [left + (width - w) / 2, top + (height - h) / 2, w, h];
}

/** Where the `slot`th one picked lies in the basket (% of the garden): it
    fits a box as wide as a third of the mouth, a little taller for a tall
    food (the garden is 4:5, so a % of its height is 1.25 of its width). */
function pileBox(garden: Garden, slot: number): SceneRect {
  const [left, top, width, height] = garden.basket;
  const aspect = garden.item.width / garden.item.height;
  const h = Math.min(width * 0.44, (width * 0.36) / (1.25 * aspect));
  const w = 1.25 * aspect * h;
  const { x, y } = PILE[slot];
  return [left + width * x - w / 2, top + height * y - h, w, h];
}

interface HarvestPickProps {
  word: string;
  /** Its plural — what is in the basket at the end ("apples"). */
  things: string;
  garden: Garden;
  /** "Tap the {word}" — each food's name for a screen reader. */
  itemAria: string;
  /** "Hear {word}" — the speaker's name. */
  hearLabel: string;
  onSolved: () => void;
}

/**
 * Pick them: Nova's garden — a tree, a bed, the stalks — with five of the
 * food on it, her basket on the grass, and the word under the picture.
 * Tap one and it comes off (out of the soil), flies into the basket and
 * lies there, its word popping up where it was — the word five times, by
 * the child's own hand. Nothing can be wrong. All five in → the word turns
 * into its plural ("apples"), and confetti.
 *
 * The garden is one render (`data/garden.ts`), laid in layers: the garden,
 * the five foods, what stands in front of them (a bed's near half, the
 * basket), what is in the basket, the basket's rim over it. A food comes
 * off behind the front and flies over everything, landing where its
 * picture in the basket then appears.
 */
export function HarvestPick({ word, things, garden, itemAria, hearLabel, onSolved }: HarvestPickProps) {
  /* Tapped, in order — each one's place in the basket — and landed. */
  const [taken, setTaken] = useState<number[]>([]);
  const [landed, setLanded] = useState<number[]>([]);
  const order = useRef<number[]>([]);
  const sceneRef = useRef<HTMLDivElement>(null);
  const foodRefs = useRef(new Map<number, HTMLSpanElement>());
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);

  const solved = landed.length === garden.items.length;

  /* Reported once the last one is in — taps land faster than renders. */
  const reported = useRef(false);
  useEffect(() => {
    if (!solved || reported.current) return;
    reported.current = true;
    void playCue(lessonCue.word(things));
    onSolved();
  }, [solved, onSolved, things]);

  /** Off the branch (out of the bed) and into the basket. Worked out in
      pixels so it ends exactly on its picture in the basket: the food
      turns and grows about its pivot, so the pivot is what is moved. */
  const fly = (i: number, slot: number) => {
    const food = foodRefs.current.get(i);
    const scene = sceneRef.current?.getBoundingClientRect();
    if (!food || !scene) return;
    const [left, top, width, height] = garden.items[i].box;
    const hit = garden.items[i].hit;
    const [pl, pt, pw, ph] = pileBox(garden, slot);
    const scale = pw / width;
    const turn = (PILE[slot].turn * Math.PI) / 180;
    const pivotY = garden.pivot === "top" ? top : top + height;
    const half = ((garden.pivot === "top" ? 1 : -1) * scale * (scene.height * height)) / 200;
    const tx = (scene.width * (pl + pw / 2 - (left + width / 2))) / 100 + half * Math.sin(turn);
    const ty = (scene.height * (pt + ph / 2 - pivotY)) / 100 - half * Math.cos(turn);
    /* Up by what of it is hidden (in the soil), and a little more. */
    const up = (scene.height * (height - hit[3] + height * 0.08)) / 100;
    const tilt = `${garden.items[i].tilt}deg`;
    food.animate(
      [
        { translate: "0px 0px", rotate: tilt, scale: "1", zIndex: 1 },
        { translate: `0px ${-up}px`, rotate: tilt, scale: "1.06", zIndex: 1, offset: OFF },
        { translate: `0px ${-up}px`, rotate: tilt, scale: "1.06", zIndex: 6, offset: OFF + 0.01 },
        { translate: `${tx}px ${ty}px`, rotate: `${PILE[slot].turn}deg`, scale: String(scale), zIndex: 6 },
      ],
      { duration: FLY_MS, easing: "cubic-bezier(0.45, 0, 0.55, 1)", fill: "forwards" },
    );
  };

  const pick = (i: number) => {
    if (order.current.includes(i)) return;
    order.current.push(i);
    const slot = order.current.length - 1;
    setTaken([...order.current]);
    void playCue(lessonCue.word(word));
    fly(i, slot);
    timers.current.push(window.setTimeout(() => setLanded((all) => (all.includes(i) ? all : [...all, i])), FLY_MS));
  };

  const sizes = (width: number) => `(min-width: 1024px) ${Math.ceil(width * 0.36)}rem, (min-width: 640px) ${Math.ceil(width * 0.3)}rem, ${Math.ceil(width * 0.92)}vw`;
  const pivot = garden.pivot === "top" ? "50% 0%" : "50% 100%";

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div className={STAGE_CARD}>
        <div
          ref={sceneRef}
          className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.35rem] lg:shadow-[0_20px_44px_-18px_rgb(var(--shadow-hue)/0.34)]"
        >
          <Image src={garden.ground} alt="" fill preload sizes={sizes(100)} className="select-none object-cover" />

          {garden.items.map(({ box, tilt }, i) =>
            landed.includes(i) ? null : (
              <span
                key={i}
                ref={(el) => {
                  if (el) foodRefs.current.set(i, el);
                  else foodRefs.current.delete(i);
                }}
                className="pointer-events-none absolute z-[1]"
                style={{ ...place(box), rotate: `${tilt}deg`, transformOrigin: pivot }}
              >
                <Image src={garden.item} alt="" fill loading="eager" sizes={sizes(box[2])} className="select-none object-contain" />
              </span>
            ),
          )}

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
                style={{ ...place(pileBox(garden, slot)), rotate: `${PILE[slot].turn}deg` }}
              >
                <Image src={garden.item} alt="" fill sizes={sizes(garden.items[i].box[2])} className="select-none object-contain" />
              </span>
            );
          })}

          <span className="pointer-events-none absolute z-[4]" style={place(garden.rim.box)}>
            <Image src={garden.rim.src} alt="" fill loading="eager" sizes={sizes(garden.rim.box[2])} className="select-none" />
          </span>

          {garden.items.map(({ hit }, i) =>
            taken.includes(i) ? null : (
              <button
                key={`tap-${i}`}
                type="button"
                aria-label={format(itemAria, { word })}
                onClick={() => pick(i)}
                className="absolute z-[5] rounded-[30%] focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]"
                style={place(tapArea(hit))}
              />
            ),
          )}

          {/* The word, where each one was picked. English: left to right. */}
          {taken.map((i) => {
            const [left, top, width] = garden.items[i].hit;
            return (
              <span
                key={`word-${i}`}
                dir="ltr"
                aria-hidden
                className="harvest-word pointer-events-none absolute z-[7] whitespace-nowrap rounded-full bg-white px-3 py-1 text-lg font-bold text-[var(--color-ink-fixed)] shadow-[0_6px_14px_-6px_rgb(var(--shadow-hue)/0.55)] sm:text-xl lg:text-2xl"
                style={{ left: `${left + width / 2}%`, top: `${top}%` } as CSSProperties}
              >
                {word}
              </span>
            );
          })}

          {solved && <Celebration />}
        </div>
      </div>

      {/* The word under the garden — every one picked says it; once the
          basket is full it is all of them: "apples". */}
      <div className="flex items-center justify-center gap-3">
        <CueButton cue={lessonCue.word(solved ? things : word)} label={format(hearLabel, { word: solved ? things : word })} size="sm" />
        <ClayWord key={solved ? "things" : "word"} word={solved ? things : word} size="sm" />
      </div>
    </div>
  );
}
