"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import Image from "next/image";
import { format } from "@/lib/format-dict";
import { shuffle } from "@/lib/seeded";
import { Celebration } from "@/components/ui/celebration";
import type { SceneItem, ShapeId } from "@/types/course";
import { FaceView } from "./face";

/** Two misses on one thing and its box starts to glow. */
const HINT_AFTER = 2;
/** How long a thing takes to fly into its box. */
const FLY_MS = 420;
/** Below this the finger never really moved — a tap, not a drag. */
const DRAG_THRESHOLD = 8;

/** The boxes, in a fixed 2x2 order, each in its shape's own clay colour
    (`data/shapes.ts`) — the shape sits on a white disc so it still shows. */
export const BINS: { shape: ShapeId; face: string; edge: string; text: string }[] = [
  { shape: "circle", face: "var(--brand)", edge: "var(--brand-dark)", text: "#fff" },
  { shape: "square", face: "var(--color-go)", edge: "var(--color-go-dark)", text: "#fff" },
  { shape: "triangle", face: "var(--color-gold)", edge: "var(--color-gold-dark)", text: "var(--color-ink-fixed)" },
  { shape: "rectangle", face: "var(--accent)", edge: "var(--accent-dark)", text: "#fff" },
];

interface SortShapesProps {
  items: SceneItem[];
  /** Deals the order the things come in. */
  seed: string;
  /** "The {shape} box", each box's screen-reader name. */
  binAria: string;
  onSolved: () => void;
  onMiss: () => void;
}

/**
 * The review's big game: things from the four picnics come one at a time,
 * and each goes in the box of its shape. Tap the box — or drag the thing
 * onto it. A right box swallows it (the thing flies in and waits there as a
 * little picture, so the boxes filling up ARE the progress); a wrong one
 * only wiggles the thing, and after two misses the right box glows. When
 * every thing is in, all four boxes jump.
 */
export function SortShapes({ items, seed, binAria, onSolved, onMiss }: SortShapesProps) {
  const order = useMemo(() => shuffle(items, seed), [items, seed]);
  const [at, setAt] = useState(0);
  const [misses, setMisses] = useState(0);
  const [shake, setShake] = useState(0);
  const [received, setReceived] = useState<{ shape: ShapeId; n: number } | null>(null);
  const [flying, setFlying] = useState(false);
  const [drag, setDrag] = useState<{ x: number; y: number; dx: number; dy: number; moved: boolean } | null>(null);

  const thingRef = useRef<HTMLDivElement>(null);
  const binRefs = useRef(new Map<ShapeId, HTMLButtonElement>());
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const current = order[at];
  const done = at >= order.length;
  const sorted = order.slice(0, at);
  const hinted = !done && misses >= HINT_AFTER ? current.shape : undefined;

  /** The thing is let go over box `shape` (a tap on it, or a drop). */
  const choose = (shape: ShapeId, offset = { dx: 0, dy: 0 }) => {
    if (done || flying) return;
    const thing = thingRef.current;
    const bin = binRefs.current.get(shape);
    if (shape !== current.shape || !thing || !bin) {
      /* Back to the middle from wherever the finger let go, then a wiggle. */
      thing?.animate([{ translate: `${offset.dx}px ${offset.dy}px` }, { translate: "0px 0px" }], { duration: 260, easing: "ease-out" });
      setShake((n) => n + 1);
      setMisses((n) => n + 1);
      onMiss();
      return;
    }

    const from = thing.getBoundingClientRect();
    const to = bin.getBoundingClientRect();
    const dx = to.left + to.width / 2 - (from.left + from.width / 2);
    const dy = to.top + to.height / 2 - (from.top + from.height / 2);
    setFlying(true);
    thing.animate(
      [
        { translate: `${offset.dx}px ${offset.dy}px`, scale: "1" },
        { translate: `${dx}px ${dy}px`, scale: "0.25", opacity: 0.4 },
      ],
      { duration: FLY_MS, easing: "cubic-bezier(0.5, 0, 0.75, 0.4)", fill: "forwards" },
    );
    timer.current = window.setTimeout(() => {
      setFlying(false);
      setMisses(0);
      setShake(0);
      setReceived((last) => ({ shape, n: (last?.n ?? 0) + 1 }));
      setAt((value) => value + 1);
      if (at + 1 === order.length) onSolved();
    }, FLY_MS);
  };

  /* ---- Dragging the thing; a real drag ends over a box or springs back ---- */
  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (done || flying) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ x: event.clientX, y: event.clientY, dx: 0, dy: 0, moved: false });
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    setDrag({ ...drag, dx, dy, moved: drag.moved || Math.hypot(dx, dy) > DRAG_THRESHOLD });
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    const { dx, dy, moved } = drag;
    setDrag(null);
    if (!moved) return;
    const over = BINS.find(({ shape }) => {
      const box = binRefs.current.get(shape)?.getBoundingClientRect();
      return box && event.clientX >= box.left && event.clientX <= box.right && event.clientY >= box.top && event.clientY <= box.bottom;
    });
    if (over) choose(over.shape, { dx, dy });
    else thingRef.current?.animate([{ translate: `${dx}px ${dy}px` }, { translate: "0px 0px" }], { duration: 260, easing: "ease-out" });
  };

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-3 sm:gap-5 lg:max-w-xl lg:gap-7">
      {/* The thing to sort, on its own card. */}
      <div className="card card-clay-white relative flex h-[min(8rem,15svh)] w-[min(8rem,15svh)] shrink-0 items-center justify-center lg:h-[min(11rem,18svh)] lg:w-[min(11rem,18svh)]">
        {done ? (
          <Celebration />
        ) : (
          <div
            key={`${at}.${shake}`}
            ref={thingRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={() => setDrag(null)}
            /* `touch-action: none` or a drag scrolls the page instead. */
            className={`relative z-10 h-[82%] w-[82%] cursor-grab touch-none select-none ${shake > 0 ? "anim-wiggle" : "anim-pop-in"}`}
            style={drag?.moved ? { translate: `${drag.dx}px ${drag.dy}px`, scale: "1.1" } : undefined}
          >
            <Image src={current.src} alt={current.word} fill sizes="8rem" draggable={false} className="pointer-events-none object-contain" />
          </div>
        )}
      </div>

      {/* The four boxes. The glow goes on a wrapper — the box has a fill. */}
      <div className="grid w-full grid-cols-2 gap-3">
        {BINS.map(({ shape, face, edge, text }, i) => {
          const inside = sorted.filter((item) => item.shape === shape);
          const jumping = done || received?.shape === shape;
          return (
            <span key={shape} className={`relative block ${hinted === shape ? "guide-target" : ""}`}>
              <button
                key={jumping ? `${shape}.${done ? "done" : received?.n}` : shape}
                ref={(el) => {
                  if (el) binRefs.current.set(shape, el);
                }}
                type="button"
                aria-label={format(binAria, { shape })}
                onClick={() => choose(shape)}
                className={`clay flex h-[min(6.25rem,12svh)] w-full lg:h-[min(8.5rem,15svh)] flex-col items-center justify-center gap-1 rounded-[1.6rem] px-2 ${
                  jumping ? "anim-jump" : ""
                }`}
                style={
                  {
                    backgroundColor: face,
                    color: text,
                    "--clay-edge": edge,
                    ...(done ? { animationDelay: `${i * 0.1}s` } : {}),
                  } as CSSProperties
                }
              >
                <span className="flex items-center gap-2">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white">
                    <FaceView face={{ kind: "shape", shape }} size="tile" />
                  </span>
                  <span dir="ltr" className="text-lg font-bold">
                    {shape}
                  </span>
                </span>
                {/* What is already in — the box filling up. */}
                <span className="flex h-7 items-center gap-1 lg:h-10 lg:gap-1.5">
                  {inside.map((item) => (
                    <span key={item.id} className="anim-pop-in relative block h-7 w-7 lg:h-10 lg:w-10">
                      <Image src={item.src} alt="" fill sizes="(min-width: 1024px) 40px, 28px" className="object-contain" />
                    </span>
                  ))}
                </span>
              </button>
            </span>
          );
        })}
      </div>
    </div>
  );
}
