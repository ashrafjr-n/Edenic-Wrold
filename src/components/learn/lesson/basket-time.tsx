"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import Image, { type StaticImageData } from "next/image";
import { Celebration } from "@/components/ui/celebration";
import { lessonCue, playCue } from "@/lib/cue";
import { format } from "@/lib/format-dict";
import { useWide } from "@/lib/use-wide";
import type { Basket, Kitchen, SceneRect } from "@/types/course";
import { ClayWord, type LetterTone } from "./clay-word";
import { place } from "./find-shapes";
import { worldCover } from "./lesson-world";

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

/* The word's one quiet ink — it is read, not matched. Fixed: its paper
   is light in dark mode too. */
const INK: LetterTone = { face: "var(--color-ink-fixed)", edge: "color-mix(in srgb, var(--color-ink-fixed) 55%, #000)" };

/** Where the vegetable lies in the basket (% of the basket picture): in
    the middle of its mouth, its lower part under the rim. */
function inBasket(basket: Basket, picture: StaticImageData): SceneRect {
  const [left, top, width, height] = basket.mouth;
  const aspect = picture.width / picture.height;
  const tall = basket.src.height / basket.src.width;
  const k = Math.min(0.78, 0.62 / aspect);
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
  /** The lesson's vegetable, in English — up on the kitchen wall. */
  word: string;
  kitchen: Kitchen;
  /** Waiting for the camera to come in at the door (it ends on this very
      picture) — laid out, not shown. */
  hidden?: boolean;
  /** "Tap the {word}", naming each thing for a screen reader. */
  itemAria: string;
  onSolved: () => void;
  onMiss: () => void;
}

/**
 * Basket Time (Nova's Vegetables, the user's design, 2026-11-01 — Find It!
 * merged into it): the kitchen in Nova's cottage, the world's last place
 * (2026-11-05), played over the whole screen as a Find in a world is. Pinki
 * behind the counter, the word over the wall, and on the counter the five
 * vegetables among a blender, milk, cheese and garlic, and a basket. Read
 * the word, then drag its vegetable into the basket, or tap it. It flies up
 * over the basket and drops in, under the rim; the basket bounces, Pinki
 * cheers, the word is said, confetti. Anything else shakes, goes home and
 * greys.
 */
export function BasketTime({ word, kitchen, hidden = false, itemAria, onSolved, onMiss }: BasketTimeProps) {
  /* A wide board gets the wide frame; a phone's or an upright tablet's,
     the tall one. */
  const wide = useWide();
  const frame = wide ? kitchen.landscape : kitchen.portrait;
  const { items, basket } = frame;
  const answer = items.findIndex((item) => item.group === word);
  const [refused, setRefused] = useState<string[]>([]);
  const [shaking, setShaking] = useState<number | null>(null);
  const [flying, setFlying] = useState(false);
  const [landed, setLanded] = useState(false);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [aim, setAim] = useState(false);
  const basketRef = useRef<HTMLSpanElement>(null);
  const pictureRefs = useRef<(HTMLSpanElement | null)[]>([]);
  /* What a tap reads — taps outrun renders. */
  const busy = useRef(false);
  /* A drag ends in a click on the same thing — that click is not a tap. */
  const dragged = useRef(false);
  const timers = useRef<number[]>([]);
  const spot = inBasket(basket, items[answer].src);

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
    pictureRefs.current[index]?.animate([{ translate: `${dx}px ${dy}px` }, { translate: "0px 0px" }], { duration: still() ? 1 : 300, easing: "cubic-bezier(0.3, 1.4, 0.5, 1)" });

  /** Thing `index` put in the basket: a tap on it, or a drop `offset`
      away from where it lay. */
  const put = (index: number, offset = { dx: 0, dy: 0 }) => {
    if (busy.current || refused.includes(items[index].id)) return;
    busy.current = true;
    setAim(false);
    if (index !== answer) {
      setShaking(index);
      navigator.vibrate?.(30);
      onMiss();
      springBack(index, offset.dx, offset.dy);
      after(MISS_MS, () => {
        setShaking(null);
        setRefused((list) => [...list, items[index].id]);
        busy.current = false;
      });
      return;
    }
    const picture = pictureRefs.current[index];
    const bin = basketRef.current;
    setFlying(true);
    if (picture && bin) {
      /* Worked out from where it lies, so it ends exactly on its place in
         the basket — and at that place's size. */
      const from = picture.getBoundingClientRect();
      const to = bin.getBoundingClientRect();
      const [l, t, w, h] = spot;
      const cx = to.left + (to.width * (l + w / 2)) / 100;
      const cy = to.top + (to.height * (t + h / 2)) / 100;
      const x = cx - (from.left + from.width / 2 - offset.dx);
      const y = cy - (from.top + from.height / 2 - offset.dy);
      const above = to.top - (from.top + from.height / 2 - offset.dy) - to.height * 0.15;
      const scale = (to.width * w) / 100 / from.width;
      picture.animate(
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

  /* ---- Dragging a thing; a real drag ends on the basket or goes home ---- */
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

  const thingSizes = wide ? "18vw" : "30vw";
  const basketSizes = wide ? "22vw" : "36vw";

  return (
    <div className={`world-frame world-find z-10 ${hidden ? "world-find--hidden" : ""}`}>
      <div className="world-cover" style={worldCover(wide)}>
        <Image src={frame.ground} alt="" fill preload sizes="100vw" className="select-none object-cover" />

        {/* Pinki behind the counter: its edge hides her lower half. */}
        <span className={`pointer-events-none absolute ${landed ? "anim-jump" : ""}`} style={place(frame.friend)}>
          <Image src={landed ? kitchen.friend.cheer : kitchen.friend.picture} alt="" fill preload sizes={wide ? "24vw" : "40vw"} className="select-none object-contain object-bottom" />
        </span>
        <span className="pointer-events-none absolute" style={place(frame.counter.box)}>
          <Image src={frame.counter.src} alt="" fill preload sizes="100vw" className="select-none" />
        </span>

        {/* The things on the counter, back to front. */}
        {items.map((item, index) => {
          const off = refused.includes(item.id);
          const gone = landed && index === answer;
          const held = drag?.index === index && drag.moved ? drag : null;
          return (
            <span
              key={item.id}
              ref={(el) => {
                pictureRefs.current[index] = el;
              }}
              className={`pointer-events-none absolute transition-[filter,opacity] duration-300 ${held ? "feed-food--held z-20" : ""} ${
                flying && index === answer ? "z-20" : ""
              } ${off ? "brightness-[0.8] saturate-0" : ""} ${gone ? "opacity-0" : ""} ${
                shaking === index ? "anim-wiggle" : ""
              }`}
              style={{ ...place(item.box), ...(held ? { translate: `${held.dx}px ${held.dy}px` } : {}) }}
            >
              <Image src={item.src} alt="" fill preload sizes={thingSizes} draggable={false} className="select-none object-contain" />
            </span>
          );
        })}

        {/* The basket: what goes in lies under its near half. */}
        <span
          ref={basketRef}
          className={`basket-bin kitchen-basket pointer-events-none absolute z-10 ${aim ? "basket-bin--aim" : ""} ${landed ? "basket-bin--in" : ""}`}
          style={place(basket.box)}
        >
          <Image src={basket.src} alt="" fill preload sizes={basketSizes} className="select-none object-contain" />
          {landed && (
            <span className="absolute" style={place(spot)}>
              <Image src={items[answer].src} alt="" fill sizes={thingSizes} className="select-none object-contain" />
            </span>
          )}
          <span className="absolute inset-0">
            <Image src={basket.rim} alt="" fill preload sizes={basketSizes} className="select-none object-contain" />
          </span>
        </span>

        {/* What a finger or a key takes: each thing itself, not its shadow. */}
        {items.map((item, index) => (
          <button
            key={`tap-${item.id}`}
            type="button"
            aria-label={format(itemAria, { word: item.word })}
            disabled={refused.includes(item.id) || landed}
            onClick={() => {
              if (!dragged.current) put(index);
            }}
            onPointerDown={onPointerDown(index)}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={() => setDrag(null)}
            /* `touch-action: none` or a drag scrolls the page instead. */
            className={`absolute z-30 touch-none select-none rounded-[22%] focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[var(--chalk-accent)] ${
              drag?.index === index && drag.moved ? "cursor-grabbing" : "cursor-grab"
            } disabled:cursor-default`}
            style={place(item.hit)}
          />
        ))}

        {landed && <Celebration />}
      </div>

      {/* The word, over the kitchen wall in every frame: English in every
          locale. Outside the picture, which a phone crops at its sides. */}
      <div dir="ltr" className="world-kitchen-word">
        <div className={`kitchen-word ${landed ? "anim-jump" : ""}`} style={{ "--word": wide ? "4.4cqi" : "9.5cqi" } as CSSProperties}>
          <ClayWord word={word} size="demo" tone={INK} />
        </div>
      </div>
    </div>
  );
}
