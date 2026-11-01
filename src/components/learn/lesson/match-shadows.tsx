"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import Image from "next/image";
import { Celebration } from "@/components/ui/celebration";
import { format } from "@/lib/format-dict";
import { lessonCue, playCue } from "@/lib/cue";
import { shuffle } from "@/lib/seeded";
import type { ShadowPair } from "@/types/course";

/** An animal flying from where it was let go into its shadow. */
const FLY_MS = 420;
/** A wrong shadow shakes this long, the animal back home. */
const MISS_MS = 480;
/** The last one lands, they all hop, then the step is solved. */
const DONE_MS = 1700;
/** A finger let go this close (px) to a shadow still means that shadow. */
const REACH = 12;
/** Below this the finger never really moved — a tap, not a drag. */
const DRAG_THRESHOLD = 8;

/* The height a step has, `--room` (as Match the footprints had it): the
   animals' row and the paper of shadows each take at most a third of it,
   so the step never pushes the page into a scroll. */
const ROOM =
  "[--room:calc(100svh-21rem-min(2.5rem,4svh))] sm:[--room:calc(100svh-38rem)] lg:[--room:calc(var(--stage-h)-1.5rem)]";

/* One cell — an animal, or its shadow — the same size above and below, so
   an animal lands exactly on its shadow: four in a row with their gaps and
   the paper's padding, never taller than a third of the room. */
const CELL = { "--cell": "min(calc((100cqi - 3 * var(--gap) - 1.5rem) / 4), calc(var(--room) * 0.36), 9.5rem)" } as CSSProperties;

interface Drag {
  index: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  moved: boolean;
}

interface MatchShadowsProps {
  /** The lesson's animal, in English — said when all four are home. */
  word: string;
  animals: readonly ShadowPair[];
  seed: string;
  /** A shadow's name for a screen reader, by where it is ("Shadow {n}") —
      never by whose it is. */
  shadowAria: string;
  onSolved: () => void;
  onMiss: () => void;
}

/** The shadows' order: a seeded deal in which no shadow lies straight
    under its own animal — that one would match itself. */
function shadowOrder(top: readonly number[], seed: string): number[] {
  for (let k = 0; k < 24; k++) {
    const order = shuffle([...top], `${seed}:shadows:${k}`);
    if (order.every((animal, i) => animal !== top[i])) return order;
  }
  return [...top.slice(1), top[0]];
}

/**
 * Match the shadow (Bloo's Animals, 2026-11-01): four animals stand on
 * Bloo's board — the lesson's and three far unlike it — over a paper with
 * their four shadows pressed into it, in another order. Drag each animal
 * onto its own shadow, or tap it and then the shadow. The right one flies
 * in and fills it exactly (its shadow IS its picture, darkened — the same
 * size), its word is said; a wrong one shakes the shadow and the animal
 * goes home. All four home: they hop one after another, the lesson's
 * animal's word, confetti.
 */
export function MatchShadows({ word, animals, seed, shadowAria, onSolved, onMiss }: MatchShadowsProps) {
  const top = useMemo(() => shuffle(animals.map((_, i) => i), `${seed}:animals`), [animals, seed]);
  const slots = useMemo(() => shadowOrder(top, seed), [top, seed]);
  const lesson = 0;
  const [placed, setPlaced] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [aim, setAim] = useState<number | null>(null);
  const [shaking, setShaking] = useState<number | null>(null);
  const [touched, setTouched] = useState(false);
  /* The animal on its way into its shadow — over the paper as it flies. */
  const [flying, setFlying] = useState<number | null>(null);
  const done = placed.length === animals.length;
  const animalRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const cellRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const slotRefs = useRef<(HTMLButtonElement | null)[]>([]);
  /* What a tap reads — taps outrun renders. */
  const busy = useRef(false);
  const home = useRef<number[]>([]);
  /* A drag ends in a click on the same animal — that click is not a tap. */
  const dragged = useRef(false);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);
  const after = (ms: number, run: () => void) => {
    timers.current.push(window.setTimeout(run, ms));
  };
  const still = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const slotUnder = (x: number, y: number) =>
    slotRefs.current.findIndex((slot, i) => {
      if (!slot || home.current.includes(slots[i])) return false;
      const s = slot.getBoundingClientRect();
      return x > s.left - REACH && x < s.right + REACH && y > s.top - REACH && y < s.bottom + REACH;
    });

  const springBack = (index: number, dx: number, dy: number) =>
    animalRefs.current[index]?.animate([{ translate: `${dx}px ${dy}px` }, { translate: "0px 0px" }], { duration: still() ? 1 : 300, easing: "cubic-bezier(0.3, 1.4, 0.5, 1)" });

  /** Animal `index` tried on the shadow at `slot`, let go `offset` from
      its own place. */
  const tryOn = (index: number, slot: number, offset = { dx: 0, dy: 0 }) => {
    if (busy.current || home.current.includes(index)) return;
    setTouched(true);
    setAim(null);
    setSelected(null);
    if (slots[slot] !== index) {
      busy.current = true;
      setShaking(slot);
      navigator.vibrate?.(30);
      onMiss();
      springBack(index, offset.dx, offset.dy);
      after(MISS_MS, () => {
        setShaking(null);
        busy.current = false;
      });
      return;
    }
    busy.current = true;
    setFlying(index);
    const from = cellRefs.current[index]?.getBoundingClientRect();
    const to = slotRefs.current[slot]?.getBoundingClientRect();
    if (from && to) {
      const x = to.left + to.width / 2 - (from.left + from.width / 2);
      const y = to.top + to.height / 2 - (from.top + from.height / 2);
      animalRefs.current[index]?.animate(
        [
          { translate: `${offset.dx}px ${offset.dy}px`, scale: "1.1" },
          { translate: `${x}px ${y}px`, scale: "1" },
        ],
        { duration: still() ? 1 : FLY_MS, easing: "cubic-bezier(0.45, 0, 0.3, 1)", fill: "forwards" },
      );
    }
    after(still() ? 0 : FLY_MS, () => {
      home.current = [...home.current, index];
      setPlaced(home.current);
      setFlying(null);
      navigator.vibrate?.([10, 40, 14]);
      if (home.current.length < animals.length) {
        void playCue(lessonCue.word(animals[index].word));
        busy.current = false;
        return;
      }
      after(500, () => void playCue(lessonCue.word(word)));
      after(DONE_MS, onSolved);
    });
  };

  /* ---- Dragging an animal; a real drag ends on a shadow or goes home ---- */
  const onPointerDown = (index: number) => (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (busy.current || home.current.includes(index)) return;
    dragged.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ index, x: event.clientX, y: event.clientY, dx: 0, dy: 0, moved: false });
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!drag) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    const moved = drag.moved || Math.hypot(dx, dy) > DRAG_THRESHOLD;
    if (moved && !drag.moved) {
      setTouched(true);
      setSelected(null);
    }
    setDrag({ ...drag, dx, dy, moved });
    if (moved) {
      const over = slotUnder(event.clientX, event.clientY);
      setAim(over < 0 ? null : over);
    }
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
    const over = slotUnder(event.clientX, event.clientY);
    if (over >= 0) tryOn(index, over, { dx, dy });
    else {
      setAim(null);
      springBack(index, dx, dy);
    }
  };

  return (
    <div className={`card card-clay-white card-bare-lg relative w-full max-w-2xl px-2 py-3 [container-type:inline-size] sm:px-6 lg:max-w-3xl ${ROOM}`}>
      <div className="flex flex-col items-center gap-[min(2.5rem,calc(var(--room)*0.1))] [--gap:0.4rem] sm:[--gap:1rem]" style={CELL}>
        {/* The animals, standing on the board. */}
        <div className="flex gap-[var(--gap)]">
          {top.map((index, i) => {
            const { word: name, picture } = animals[index];
            const gone = placed.includes(index);
            const held = drag?.index === index && drag.moved ? drag : null;
            const picked = selected === index;
            return (
              <button
                key={name}
                ref={(el) => {
                  cellRefs.current[index] = el;
                }}
                type="button"
                aria-label={name}
                aria-pressed={picked}
                disabled={gone || done}
                onClick={() => {
                  if (dragged.current || busy.current) return;
                  setTouched(true);
                  setSelected(picked ? null : index);
                }}
                onPointerDown={onPointerDown(index)}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={() => setDrag(null)}
                /* `touch-action: none` or a drag scrolls the page instead. */
                className={`relative block h-[var(--cell)] w-[var(--cell)] shrink-0 touch-none select-none rounded-[22%] focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[var(--chalk-accent)] ${
                  held || picked || flying === index ? "z-20" : ""
                } ${gone ? "" : held ? "cursor-grabbing" : "cursor-grab"}`}
              >
                {/* Where it stood, once it is home: a chalk outline. */}
                {gone && <span aria-hidden className="shadow-spot absolute inset-[6%] rounded-[22%]" />}
                {!gone && (
                  <span className={`block h-full w-full ${!touched && index === lesson ? "guide-target" : ""}`}>
                    <span
                      ref={(el) => {
                        animalRefs.current[index] = el;
                      }}
                      className={`shadow-animal pointer-events-none relative block h-full w-full ${held ? "shadow-animal--held" : picked ? "shadow-animal--picked" : "shadow-bob"}`}
                      style={{ ...(held ? { translate: `${held.dx}px ${held.dy}px` } : {}), animationDelay: `${i * -0.7}s` }}
                    >
                      <Image src={picture} alt="" fill preload sizes="(min-width: 1024px) 9.5rem, 22vw" draggable={false} className="object-contain" />
                    </span>
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Their shadows, pressed into a paper on the board. */}
        <div className="card card-clay-white pic-card flex gap-[var(--gap)] p-3">
          {slots.map((index, i) => {
            const { picture, shadow } = animals[index];
            const filled = placed.includes(index);
            const order = placed.indexOf(index);
            return (
              <button
                key={i}
                ref={(el) => {
                  slotRefs.current[i] = el;
                }}
                type="button"
                aria-label={format(shadowAria, { n: i + 1 })}
                disabled={filled || done}
                onClick={() => {
                  if (selected !== null) tryOn(selected, i);
                }}
                className={`relative block h-[var(--cell)] w-[var(--cell)] shrink-0 rounded-[18%] transition-[scale] duration-200 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[var(--chalk-accent)] ${
                  aim === i || (selected !== null && !filled) ? "shadow-slot--aim" : ""
                } ${aim === i ? "scale-[1.06]" : ""} ${shaking === i ? "anim-wiggle" : ""}`}
              >
                <Image src={shadow} alt="" fill preload sizes="(min-width: 1024px) 9.5rem, 22vw" draggable={false} className="pointer-events-none object-contain" />
                {filled && (
                  <span
                    aria-hidden
                    className={`shadow-land pointer-events-none absolute inset-0 ${done ? "shadow-hop" : ""}`}
                    style={done ? { animationDelay: `${order * 120}ms` } : undefined}
                  >
                    <Image src={picture} alt="" fill sizes="(min-width: 1024px) 9.5rem, 22vw" draggable={false} className="object-contain" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      {done && <Celebration />}
    </div>
  );
}
