"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import Image, { type StaticImageData } from "next/image";
import { Celebration } from "@/components/ui/celebration";
import { MAKERS } from "@/data/market";
import { format } from "@/lib/format-dict";
import { lessonCue } from "@/lib/cue";
import { shuffle } from "@/lib/seeded";
import type { Face, Maker } from "@/types/course";
import { ClayWord } from "./clay-word";
import { CueButton } from "./cue-button";
import { FaceView } from "./face";
import { place } from "./find-shapes";
import { ListNote, wordOf } from "./shop-list";

/** Two misses and the next thing to put in starts to glow. */
const HINT_AFTER = 2;
/** How long a thing takes to fly in. */
const FLY_MS = 480;
/** Below this the finger never really moved — a tap, not a drag. */
const DRAG_THRESHOLD = 8;
/** The blender whirs (the pot bubbles) this long before it fills — in step
    with `.make-blend` / `.make-sink` in `globals.css`. */
const WHIR_MS = 1100;
/** …and fills this long (`.make-fill-*`), then it is done. */
const FILL_MS = 900;

type Phase = "adding" | "whirring" | "full";

interface Drag {
  index: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  moved: boolean;
}

interface MakeFoodProps {
  /** The English word of what goes in — or a recipe of a few. */
  list: string[];
  /** Everything beside the blender (the pot), each named by its word. */
  stall: Face[];
  into: Maker;
  /** The blender (the pot) full — it lies exactly over the empty one. */
  full: StaticImageData;
  /** What it pours out: a glass of the juice. */
  serve?: StaticImageData;
  /** Deals the stall. */
  seed: string;
  /** "Tap the {word}" — each thing's name for a screen reader. */
  itemAria: string;
  /** "Hear {word}" — each word's speaker. */
  hearLabel: string;
  onSolved: () => void;
  onMiss: () => void;
}

/**
 * Make it: the word on top (its speaker beside it) — or, for a recipe,
 * Nova's note — the things on the left, Nova's blender (or her soup pot)
 * on the right. Drag the thing the word names into it, or tap it and it
 * flies in; a thing not wanted wiggles back, and after two misses the next
 * one to put in glows. Once everything is in, the blender whirs (the pot
 * bubbles), what is in it spins (sinks) away, and it fills — the juice
 * rising up the jar, the soup spreading — and a juice pours out into a
 * glass where the things stood.
 */
export function MakeFood({ list, stall, into, full, serve, seed, itemAria, hearLabel, onSolved, onMiss }: MakeFoodProps) {
  const order = useMemo(() => shuffle(stall.map((_, i) => i), seed), [stall, seed]);
  const [got, setGot] = useState<string[]>([]);
  const [phase, setPhase] = useState<Phase>("adding");
  const [shake, setShake] = useState<{ index: number; n: number } | null>(null);
  const [misses, setMisses] = useState(0);
  const [flying, setFlying] = useState<number | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const makerRef = useRef<HTMLDivElement>(null);
  const thingRefs = useRef(new Map<number, HTMLSpanElement>());
  /* A drag ends in a click on the same tile — that click is not a tap. */
  const dragged = useRef(false);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);
  const after = (ms: number, run: () => void) => {
    timers.current.push(window.setTimeout(run, ms));
  };

  const { empty, inside } = MAKERS[into];
  const [left, top, width, height] = inside;
  const blender = into === "blender";
  const adding = phase === "adding";
  const recipe = list.length > 1;
  const wanted = (word: string) => list.includes(word) && !got.includes(word);
  const hinted = adding && misses >= HINT_AFTER ? stall.findIndex((face) => wanted(wordOf(face))) : -1;
  /* What is in, piled where the jar's inside (the pot's mouth) is. */
  const pile = got.map((word) => stall.find((face) => wordOf(face) === word)).filter((face): face is Face => face !== undefined);

  const springBack = (index: number, dx: number, dy: number) =>
    thingRefs.current.get(index)?.animate([{ translate: `${dx}px ${dy}px` }, { translate: "0px 0px" }], { duration: 260, easing: "ease-out" });

  /** Thing `index` is let go: a tap on it, or a drop over the blender
      `offset` away from its tile. */
  const put = (index: number, offset = { dx: 0, dy: 0 }) => {
    if (!adding || flying !== null) return;
    const word = wordOf(stall[index]);
    if (!wanted(word)) {
      springBack(index, offset.dx, offset.dy);
      setShake((last) => ({ index, n: (last?.n ?? 0) + 1 }));
      setMisses((count) => count + 1);
      onMiss();
      return;
    }
    const thing = thingRefs.current.get(index);
    const box = makerRef.current;
    if (thing && box) {
      const from = thing.getBoundingClientRect();
      const to = box.getBoundingClientRect();
      const x = to.left + (to.width * (left + width / 2)) / 100 - (from.left + from.width / 2);
      const y = to.top + (to.height * (top + height * 0.62)) / 100 - (from.top + from.height / 2);
      thing.animate(
        [
          { translate: `${offset.dx}px ${offset.dy}px`, scale: "1" },
          { translate: `${x}px ${y}px`, scale: "0.4" },
        ],
        { duration: FLY_MS, easing: "cubic-bezier(0.5, 0, 0.75, 0.4)", fill: "forwards" },
      );
    }
    setFlying(index);
    after(FLY_MS, () => {
      setFlying(null);
      setMisses(0);
      const next = [...got, word];
      setGot(next);
      if (next.length < list.length) return;
      setPhase("whirring");
      after(WHIR_MS, () => {
        setPhase("full");
        after(FILL_MS, onSolved);
      });
    });
  };

  /* ---- Dragging a thing; a real drag ends over the blender or springs back ---- */
  const onPointerDown = (index: number) => (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!adding || flying !== null) return;
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
    const box = makerRef.current?.getBoundingClientRect();
    const over = box && event.clientX >= box.left && event.clientX <= box.right && event.clientY >= box.top && event.clientY <= box.bottom;
    if (over) put(index, { dx, dy });
    else springBack(index, dx, dy);
  };

  return (
    /* Phone and tablet: the word across the top, the things in a column on
       the left, the blender on the right — a recipe's note goes over the
       things. Desktop: the word (the note) over the things on the left,
       the blender on the right, as tall as the stage. */
    <div
      className={`grid w-full max-w-md items-center gap-x-4 gap-y-4 sm:max-w-xl sm:gap-x-8 sm:gap-y-6 lg:w-auto lg:max-w-4xl lg:grid-cols-[auto_auto] lg:gap-x-16 lg:gap-y-6 lg:[grid-template-areas:'word_maker'_'stall_maker'] [@media(max-height:700px)]:gap-y-2.5 ${
        recipe
          ? "grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] [grid-template-areas:'word_maker'_'stall_maker']"
          : "grid-cols-[minmax(0,2fr)_minmax(0,3fr)] [grid-template-areas:'word_word'_'stall_maker']"
      }`}
    >
      {/* What goes in: the word (read it, or hear it) — or the recipe. */}
      <div className="flex min-w-0 items-center justify-center gap-3 self-end [grid-area:word] lg:gap-4">
        {recipe ? (
          <ListNote list={list} got={got} hearLabel={hearLabel} className="w-full lg:w-72" />
        ) : (
          <>
            <CueButton cue={lessonCue.word(list[0])} label={format(hearLabel, { word: list[0] })} size="lg" />
            <ClayWord word={list[0]} size="sm" />
          </>
        )}
      </div>

      {/* The things. Once it is made they make way for the glass. */}
      <div className="relative self-start [grid-area:stall]">
        <ul className={`grid justify-items-center gap-2.5 sm:gap-4 ${recipe ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-1 lg:grid-cols-3"}`}>
          {order.map((index) => {
            const word = wordOf(stall[index]);
            const taken = got.includes(word);
            const isShaking = shake?.index === index;
            /* Where the finger has it, while it is being dragged. */
            const held = drag?.index === index && drag.moved ? drag : null;
            return (
              <li
                key={index}
                className={`relative aspect-square w-full transition-opacity duration-300 lg:max-w-none ${
                  recipe
                    ? "max-w-[min(6rem,11svh)] sm:max-w-28 lg:w-[min(7rem,calc(var(--stage-h)*0.28))] [@media(max-height:700px)]:max-w-[min(6rem,9.5svh)]"
                    : "max-w-[min(6.5rem,11.5svh)] sm:max-w-32 lg:w-[min(8.5rem,calc(var(--stage-h)*0.3))]"
                } ${hinted === index ? "guide-target" : ""} ${phase === "full" && serve ? "opacity-0" : ""}`}
              >
                {taken ? (
                  <span className="letter-slot block h-full w-full" />
                ) : (
                  <button
                    key={isShaking ? `${index}.${shake.n}` : index}
                    type="button"
                    aria-label={format(itemAria, { word })}
                    disabled={!adding}
                    onClick={() => {
                      if (!dragged.current) put(index);
                    }}
                    onPointerDown={onPointerDown(index)}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={() => setDrag(null)}
                    /* `touch-action: none` or a drag scrolls the page instead. */
                    className={`card card-clay-white flex h-full w-full touch-none select-none items-center justify-center transition-transform duration-200 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[var(--page-accent-color)] active:scale-95 ${
                      held ? "cursor-grabbing" : "cursor-grab"
                    } ${isShaking ? "anim-wiggle" : ""} ${adding ? "hover:outline-4 hover:outline-offset-4 hover:outline-[color-mix(in_srgb,var(--page-accent-color)_45%,transparent)]" : ""}`}
                  >
                    <span
                      ref={(el) => {
                        if (el) thingRefs.current.set(index, el);
                        else thingRefs.current.delete(index);
                      }}
                      className={`pointer-events-none relative flex h-full w-full items-center justify-center ${flying === index || held ? "z-20" : ""}`}
                      style={held ? { translate: `${held.dx}px ${held.dy}px`, scale: "1.1" } : undefined}
                    >
                      <FaceView face={stall[index]} size="tile" />
                    </span>
                  </button>
                )}
              </li>
            );
          })}
        </ul>
        {serve && phase === "full" && (
          <span className="anim-pop-in pointer-events-none absolute inset-[-8%]" style={{ animationDelay: "0.55s" }}>
            <Image src={serve} alt="" fill sizes="(min-width: 1024px) 18rem, 9rem" className="object-contain" />
          </span>
        )}
      </div>

      {/* The blender (the pot): empty, what is in it, then full. */}
      <div
        ref={makerRef}
        /* As tall as `--maker-h` allows and never wider than its column; on
           a desktop the column is sized BY it (an auto column), so there it
           takes its width from its height alone, capped for the wide pot. */
        className={`relative w-[min(100%,calc(var(--maker-h)*var(--maker-ratio)))] justify-self-center [grid-area:maker] [--maker-h:min(15rem,33svh)] sm:[--maker-h:min(20rem,30svh)] lg:w-[min(22rem,calc(var(--maker-h)*var(--maker-ratio)))] lg:[--maker-h:min(24rem,calc(var(--stage-h)-1rem))] ${
          phase === "whirring" ? (blender ? "make-whir" : "make-bubble") : ""
        }`}
        style={{ aspectRatio: `${empty.width} / ${empty.height}`, "--maker-ratio": empty.width / empty.height } as CSSProperties}
      >
        <Image src={empty} alt="" fill preload sizes="(min-width: 1024px) 22rem, 12rem" className="select-none object-contain" />
        {/* Loaded up front, so it is there the moment it fills. */}
        <Image
          src={full}
          alt=""
          fill
          preload
          sizes="(min-width: 1024px) 22rem, 12rem"
          className={`select-none object-contain ${phase === "full" ? (blender ? "make-fill-up" : "make-fill-out") : "opacity-0"}`}
          style={{ "--fill-from": `${top + height}%`, "--fill-at": `${left + width / 2}% ${top + height / 2}%` } as CSSProperties}
        />
        {phase !== "full" && (
          <div className="pointer-events-none absolute flex items-end justify-center" style={place(inside)}>
            {pile.map((face, i) => (
              <span
                key={wordOf(face)}
                className={`relative -mx-[5%] block w-[46%] ${blender ? "h-[46%]" : "h-[78%] self-center"} ${
                  phase === "whirring" ? (blender ? "make-blend" : "make-sink") : "anim-pop-in"
                }`}
                style={{ zIndex: i, rotate: `${(i % 2 ? 1 : -1) * 10}deg` }}
              >
                {face.kind === "picture" && <Image src={face.src} alt="" fill sizes="5rem" className="object-contain" />}
              </span>
            ))}
          </div>
        )}
        {phase === "full" && !blender && (
          <span aria-hidden className="pointer-events-none absolute" style={place([left, top - height * 0.6, width, height])}>
            {[30, 50, 70].map((x, i) => (
              <span key={x} className="make-steam" style={{ left: `${x}%`, animationDelay: `${i * 0.6}s` }} />
            ))}
          </span>
        )}
        {phase === "full" && <Celebration />}
      </div>
    </div>
  );
}
