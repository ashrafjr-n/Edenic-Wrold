"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import Image, { type StaticImageData } from "next/image";
import { Heart } from "lucide-react";
import { Celebration } from "@/components/ui/celebration";
import { lessonCue, playCue } from "@/lib/cue";
import { shuffle } from "@/lib/seeded";
import type { Food } from "@/types/course";

/** The food flying into the mouth. */
const FLY_MS = 520;
/** Munching, then the word, then the step is solved. */
const DONE_MS = 1900;
/** A wrong food: the head shakes this long, the food goes home. */
const MISS_MS = 520;
/** Below this the finger never really moved — a tap, not a drag. */
const DRAG_THRESHOLD = 8;
/** A finger let go this close (px) to the animal still feeds it. */
const REACH = 16;

/* The height a step has, `--room` (as Match the shadow has it): the
   animal takes about half, the paper of food a quarter. */
const ROOM =
  "[--room:calc(100svh-21rem-min(2.5rem,4svh))] sm:[--room:calc(100svh-38rem)] lg:[--room:calc(var(--stage-h)-1.5rem)]";
const SIZES = {
  "--food": "min(calc((100cqi - 2 * var(--gap) - 1.5rem) / 3), calc(var(--room) * 0.27), 8.5rem)",
} as CSSProperties;

/* The hearts out of its mouth, a little apart and one after another. */
const HEARTS = [
  { x: -6, delay: 0, size: 9 },
  { x: 5, delay: 220, size: 7 },
  { x: -1, delay: 440, size: 8 },
];

interface Drag {
  index: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  moved: boolean;
}

interface FeedAnimalProps {
  /** The animal, in English, and its picture. */
  word: string;
  picture: StaticImageData;
  /** Where its mouth is, in % of its picture. */
  mouth: readonly [number, number];
  /** Its own food first, then two it does not eat. */
  foods: readonly Food[];
  seed: string;
  onSolved: () => void;
  onMiss: () => void;
}

/**
 * Feed the animal (Bloo's Animals, the user's design, 2026-11-01): the
 * lesson's animal on Bloo's board and three foods on a paper under it —
 * its own and two it would never eat. Drag one onto it, or tap it. Its
 * food flies into its mouth: it munches, hearts float up, its word is
 * said (its own sound, once audio lands). Anything else: it shakes its
 * head, the food goes home and greys.
 */
export function FeedAnimal({ word, picture, mouth, foods, seed, onSolved, onMiss }: FeedAnimalProps) {
  const order = useMemo(() => shuffle(foods.map((_, i) => i), `${seed}:food`), [foods, seed]);
  const [refused, setRefused] = useState<number[]>([]);
  const [eaten, setEaten] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [aim, setAim] = useState(false);
  const animalRef = useRef<HTMLSpanElement>(null);
  const foodRefs = useRef<(HTMLSpanElement | null)[]>([]);
  /* What a tap reads — taps outrun renders. */
  const busy = useRef(false);
  /* A drag ends in a click on the same food — that click is not a tap. */
  const dragged = useRef(false);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);
  const after = (ms: number, run: () => void) => {
    timers.current.push(window.setTimeout(run, ms));
  };
  const still = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const overAnimal = (x: number, y: number) => {
    const box = animalRef.current?.getBoundingClientRect();
    return Boolean(box && x > box.left - REACH && x < box.right + REACH && y > box.top - REACH && y < box.bottom + REACH);
  };

  const springBack = (index: number, dx: number, dy: number) =>
    foodRefs.current[index]?.animate([{ translate: `${dx}px ${dy}px` }, { translate: "0px 0px" }], { duration: still() ? 1 : 300, easing: "cubic-bezier(0.3, 1.4, 0.5, 1)" });

  /** Food `index` given to the animal: a tap on it, or a drop `offset`
      away from where it lay. */
  const give = (index: number, offset = { dx: 0, dy: 0 }) => {
    if (busy.current || refused.includes(index)) return;
    busy.current = true;
    setAim(false);
    if (index !== 0) {
      setShaking(true);
      navigator.vibrate?.(30);
      onMiss();
      springBack(index, offset.dx, offset.dy);
      after(MISS_MS, () => {
        setShaking(false);
        setRefused((list) => [...list, index]);
        busy.current = false;
      });
      return;
    }
    const food = foodRefs.current[index];
    const animal = animalRef.current;
    if (food && animal) {
      /* Worked out from where the food lies, not where the finger has it. */
      const from = food.getBoundingClientRect();
      const to = animal.getBoundingClientRect();
      const x = to.left + (to.width * mouth[0]) / 100 - (from.left + from.width / 2 - offset.dx);
      const y = to.top + (to.height * mouth[1]) / 100 - (from.top + from.height / 2 - offset.dy);
      food.animate(
        [
          { translate: `${offset.dx}px ${offset.dy}px`, scale: "1.1", opacity: 1 },
          { translate: `${x}px ${y}px`, scale: "0.32", opacity: 1, offset: 0.86 },
          { translate: `${x}px ${y}px`, scale: "0.15", opacity: 0 },
        ],
        { duration: still() ? 1 : FLY_MS, easing: "cubic-bezier(0.45, 0, 0.55, 1)", fill: "forwards" },
      );
    }
    after(still() ? 0 : FLY_MS, () => {
      setEaten(true);
      navigator.vibrate?.([10, 40, 14]);
      /* Three bites. Reduced motion: none — the hearts are enough. */
      if (!still()) {
        animal?.animate(
          [
            { scale: "1 1" },
            { scale: "1.05 0.93", offset: 0.12 },
            { scale: "0.98 1.03", offset: 0.25 },
            { scale: "1.05 0.93", offset: 0.4 },
            { scale: "0.98 1.03", offset: 0.53 },
            { scale: "1.05 0.93", offset: 0.68 },
            { scale: "1 1" },
          ],
          { duration: 1000, easing: "ease-in-out" },
        );
      }
      after(500, () => void playCue(lessonCue.word(word)));
      after(DONE_MS, onSolved);
    });
  };

  /* ---- Dragging a food; a real drag ends on the animal or goes home ---- */
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
    if (moved) setAim(overAnimal(event.clientX, event.clientY));
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
    if (overAnimal(event.clientX, event.clientY)) give(index, { dx, dy });
    else {
      setAim(false);
      springBack(index, dx, dy);
    }
  };

  return (
    <div className={`card card-clay-white card-bare-lg relative w-full max-w-2xl px-2 py-3 [container-type:inline-size] sm:px-6 lg:max-w-3xl ${ROOM}`}>
      <div className="flex flex-col items-center gap-[min(2rem,calc(var(--room)*0.07))] [--gap:0.6rem] sm:[--gap:1.25rem]" style={SIZES}>
        {/* The animal, waiting to be fed. */}
        <span
          ref={animalRef}
          className={`feed-animal relative block h-[min(17rem,calc(var(--room)*0.52))] origin-bottom ${aim ? "feed-animal--aim" : ""} ${shaking ? "feed-no" : ""}`}
          style={{ aspectRatio: picture.width / picture.height }}
        >
          <Image src={picture} alt={word} fill preload sizes="(min-width: 1024px) 14rem, 45vw" draggable={false} className="pointer-events-none select-none object-contain" />
          {eaten &&
            HEARTS.map(({ x, delay, size }, i) => (
              <span
                key={i}
                aria-hidden
                className="feed-heart pointer-events-none absolute z-[4] block text-[var(--accent)]"
                style={{ left: `calc(${mouth[0] + x}% - ${size / 2}cqi)`, top: `${mouth[1]}%`, width: `${size}cqi`, height: `${size}cqi`, animationDelay: `${delay}ms` }}
              >
                <Heart className="h-full w-full fill-current drop-shadow-sm" strokeWidth={1.5} />
              </span>
            ))}
        </span>

        {/* The food, on a paper on the board. */}
        <div className="card card-clay-white pic-card grid grid-cols-[repeat(3,var(--food))] gap-[var(--gap)] p-3">
          {order.map((index) => {
            const { word: name, src } = foods[index];
            const off = refused.includes(index);
            const gone = eaten && index === 0;
            const held = drag?.index === index && drag.moved ? drag : null;
            return (
              <button
                key={name}
                type="button"
                aria-label={name}
                disabled={off || eaten}
                onClick={() => {
                  if (!dragged.current) give(index);
                }}
                onPointerDown={onPointerDown(index)}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={() => setDrag(null)}
                /* `touch-action: none` or a drag scrolls the page instead. */
                className={`relative block h-[var(--food)] w-[var(--food)] touch-none select-none rounded-[22%] transition-[filter] duration-300 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[var(--chalk-accent)] ${
                  held ? "z-20 cursor-grabbing" : "cursor-grab"
                } ${off ? "brightness-[0.8] saturate-0" : ""} ${eaten && !gone ? "opacity-40" : ""}`}
              >
                <span
                  ref={(el) => {
                    foodRefs.current[index] = el;
                  }}
                  className={`feed-food pointer-events-none relative block h-full w-full ${held ? "feed-food--held" : ""}`}
                  style={held ? { translate: `${held.dx}px ${held.dy}px` } : undefined}
                >
                  <Image src={src} alt="" fill preload sizes="(min-width: 1024px) 8.5rem, 26vw" draggable={false} className="object-contain p-[8%]" />
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {eaten && <Celebration />}
    </div>
  );
}
