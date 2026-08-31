"use client";

import { useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import Image from "next/image";
import { Flame } from "lucide-react";
import { numberItems } from "@/data/number-items";
import { Numeral } from "./numeral";

interface NumberPathProps {
  /** The numbers shown along the path, in order. */
  numbers: readonly number[];
  /** Which one Pinki has to reach — always one of `numbers`. */
  target: number;
  /** The character's colour, used to ring the stop she has to reach. */
  accent: string;
  onFinish: () => void;
}

interface BoardPoint {
  x: number;
  y: number;
}

interface Waypoint extends BoardPoint {
  /** Where that stop's numeral sits — BESIDE its circle, never on it. Pinki
      stands on the circles, so a numeral underneath one would be hidden the
      whole time (the first stop's number especially, where she starts). */
  lx: number;
  ly: number;
}

/** Five fixed stops in a 0–100 board square, hand-picked for a gentle
    top-to-bottom zigzag — the same "coarse, hand-tuned" spirit as
    `number-strokes.ts`. The geometry never changes; only which numbers and
    which one is the target does. Labels sit outward, away from the middle
    of the board, so they never land on the path itself. */
const SLOTS: readonly Waypoint[] = [
  { x: 30, y: 9, lx: 11, ly: 9 },
  { x: 74, y: 27, lx: 91, ly: 27 },
  { x: 36, y: 51, lx: 14, ly: 51 },
  { x: 76, y: 75, lx: 91, ly: 75 },
  { x: 30, y: 92, lx: 11, ly: 92 },
];

const DRAG_THRESHOLD = 8;
/** How close, in board percent, counts as "reached" — generous, this is a
    free drag toward a target, not a precise trace. */
const CATCH_RADIUS = 13;
/** Board-percent distance past which the gauge reads fully cold. */
const COLD_DISTANCE = 62;

const PINKI_TOKEN = "/assets/learn-with-pinki/pinki/pinki-speak.png";

interface DragState {
  startX: number;
  startY: number;
  dx: number;
  dy: number;
  moved: boolean;
}

function distance(a: BoardPoint, b: BoardPoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

const imageFor = (value: number) =>
  numberItems.find((item) => item.value === value)?.image ?? "";

/**
 * "Help Pinki reach Number 5!" — a winding path of neighbouring numbers, with
 * Pinki dragged along it toward the target.
 *
 * Unlike `TraceBoard`, the path itself is scenery, not a track the child must
 * stay glued to — success is a free drag that ends close enough to the
 * target marker. That is deliberately more forgiving than tracing: this
 * activity is about reaching a number, not about handwriting precision. A
 * side gauge reads "hot" the closer the drag gets and "cold" the further it
 * strays, so the feedback is continuous rather than only a pass/fail at the
 * very end.
 *
 * Dragging is required — a tap does nothing. Walking Pinki there IS the
 * activity, so before the child's first drag a ghost of her token travels
 * the route on a loop, showing what to do. It stops for good the moment they
 * take over, the same way `SayItButton`'s invite pulse does.
 */
export function NumberPath({ numbers, target, accent, onFinish }: NumberPathProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const targetIndex = Math.max(0, numbers.indexOf(target));
  const targetSlot = SLOTS[targetIndex];
  const startSlot = SLOTS[0];

  const [drag, setDrag] = useState<DragState | null>(null);
  const [heat, setHeat] = useState(0);
  /* The route demo runs until the child's first real drag, then never again. */
  const [everDragged, setEverDragged] = useState(false);
  const [snap, setSnap] = useState<{ dx: number; dy: number } | null>(null);
  const [solved, setSolved] = useState(false);

  const toBoardPoint = (clientX: number, clientY: number): BoardPoint | null => {
    const bounds = boardRef.current?.getBoundingClientRect();
    if (!bounds || bounds.width === 0) return null;
    return {
      x: ((clientX - bounds.left) / bounds.width) * 100,
      y: ((clientY - bounds.top) / bounds.height) * 100,
    };
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (solved || snap) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ startX: event.clientX, startY: event.clientY, dx: 0, dy: 0, moved: false });
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!drag) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    setDrag({
      ...drag,
      dx,
      dy,
      moved: drag.moved || Math.hypot(dx, dy) > DRAG_THRESHOLD,
    });
    if (!drag.moved && Math.hypot(dx, dy) > DRAG_THRESHOLD) setEverDragged(true);

    const point = toBoardPoint(event.clientX, event.clientY);
    if (point) {
      const dist = distance(point, targetSlot);
      setHeat(Math.max(0, Math.min(1, 1 - dist / COLD_DISTANCE)));
    }
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!drag) return;
    event.currentTarget.releasePointerCapture(event.pointerId);

    /* A tap puts her back down and nothing else: carrying Pinki to the
       number is the exercise, so it cannot be passed by tapping her. */
    const point = drag.moved ? toBoardPoint(event.clientX, event.clientY) : null;
    const reached = point && distance(point, targetSlot) <= CATCH_RADIUS;
    const bounds = boardRef.current?.getBoundingClientRect();

    if (reached && bounds) {
      setSnap({
        dx: ((targetSlot.x - startSlot.x) / 100) * bounds.width,
        dy: ((targetSlot.y - startSlot.y) / 100) * bounds.height,
      });
      setHeat(1);
      window.setTimeout(() => {
        setSolved(true);
        onFinish();
      }, 300);
    } else {
      setHeat(0);
    }
    setDrag(null);
  };

  return (
    <div className="card anim-rise-in flex flex-row items-stretch gap-4 p-5 sm:gap-6 sm:p-7">
      <div
        ref={boardRef}
        className="relative h-72 w-56 shrink-0 sm:h-[22rem] sm:w-72"
      >
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
          <polyline
            points={SLOTS.map((slot) => `${slot.x},${slot.y}`).join(" ")}
            fill="none"
            stroke="var(--color-locked)"
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points={SLOTS.map((slot) => `${slot.x},${slot.y}`).join(" ")}
            fill="none"
            stroke="var(--color-locked-dark)"
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeDasharray="0 9"
          />
        </svg>

        {numbers.map((value, index) => {
          const slot = SLOTS[index];
          const isTarget = index === targetIndex;

          return (
            <span key={value}>
              {/* The stop itself: a circle ON the path. This is what Pinki has
                  to be brought to — the target's is bigger, ringed in the
                  character's colour and pulsing, so where to go is never a
                  guess. */}
              <span
                className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--surface)] shadow-[0_6px_14px_-6px_rgb(var(--shadow-hue)/45%)] ${
                  isTarget ? "anim-pulse-invite h-11 w-11 sm:h-14 sm:w-14" : "h-6 w-6 sm:h-7 sm:w-7"
                }`}
                style={{
                  left: `${slot.x}%`,
                  top: `${slot.y}%`,
                  border: isTarget ? `4px solid ${accent}` : "3px solid var(--color-locked-dark)",
                }}
                aria-hidden
              />

              <span
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${slot.lx}%`, top: `${slot.ly}%` }}
              >
                <Numeral
                  value={value}
                  image={imageFor(value)}
                  sizeClass={
                    isTarget ? "h-14 w-14 sm:h-[4.5rem] sm:w-[4.5rem]" : "h-9 w-9 sm:h-11 sm:w-11"
                  }
                  decorative
                />
              </span>
            </span>
          );
        })}

        {/* The demo: a ghost of Pinki's token walking the route, looping
            until the child takes over. Shown first so nobody has to guess
            that this one is dragged rather than tapped. */}
        {!everDragged && !solved && (
          <span
            className="path-hint pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
            style={
              {
                left: `${startSlot.x}%`,
                top: `${startSlot.y}%`,
                "--hint-x0": `${startSlot.x}%`,
                "--hint-y0": `${startSlot.y}%`,
                "--hint-x1": `${SLOTS[1].x}%`,
                "--hint-y1": `${SLOTS[1].y}%`,
                "--hint-x2": `${targetSlot.x}%`,
                "--hint-y2": `${targetSlot.y}%`,
              } as CSSProperties
            }
            aria-hidden
          >
            <span className="card card-pill flex h-14 w-14 items-center justify-center p-1 opacity-70 sm:h-16 sm:w-16">
              <Image
                src={PINKI_TOKEN}
                alt=""
                width={475}
                height={539}
                draggable={false}
                className="h-full w-full select-none object-contain"
              />
            </span>
          </span>
        )}

        <button
          type="button"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            setDrag(null);
            setHeat(0);
          }}
          disabled={solved || snap !== null}
          aria-label={`Drag Pinki toward number ${target}`}
          className={`absolute -translate-x-1/2 -translate-y-1/2 touch-none rounded-full ${
            drag?.moved || snap ? "" : "transition-all duration-300"
          }`}
          style={{
            left: `${startSlot.x}%`,
            top: `${startSlot.y}%`,
            /* The centring stays IN the inline value: `translate` is a
               standalone property in Tailwind v4, so an inline `translate`
               replaces `-translate-x-1/2 -translate-y-1/2` outright and the
               token would jump half its own size the moment a drag starts. */
            translate: drag?.moved
              ? `calc(-50% + ${drag.dx}px) calc(-50% + ${drag.dy}px)`
              : snap
                ? `calc(-50% + ${snap.dx}px) calc(-50% + ${snap.dy}px)`
                : undefined,
            scale: drag?.moved ? "1.1" : "1",
          }}
        >
          <span className="card card-pill anim-breathe flex h-14 w-14 items-center justify-center p-1 sm:h-16 sm:w-16">
            <Image
              src={PINKI_TOKEN}
              alt="Pinki"
              width={475}
              height={539}
              draggable={false}
              className="h-full w-full select-none object-contain"
            />
          </span>
        </button>
      </div>

      {/* The heat gauge: a thermometer that reads hotter the closer the
          current drag is to the target. Built from one fixed gradient
          revealed bottom-up by `heat`, rather than interpolating colors in
          JS — the gradient itself already goes cool-to-hot top to bottom. */}
      <div className="flex flex-1 flex-col items-center justify-between py-1">
        <Flame
          className="shrink-0"
          style={
            {
              width: "1.75rem",
              height: "1.75rem",
              color: heat > 0.55 ? "#ff6a3c" : "var(--color-locked-text)",
              opacity: 0.5 + heat * 0.5,
              scale: `${0.85 + heat * 0.4}`,
              transition: "color 0.2s ease, opacity 0.2s ease, scale 0.2s ease",
            } as CSSProperties
          }
          strokeWidth={2.5}
        />

        <div className="relative w-3 flex-1 overflow-hidden rounded-full bg-[var(--color-locked)] sm:w-4">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "linear-gradient(to top, var(--brand) 0%, var(--color-gold) 55%, #ff6a3c 100%)",
              clipPath: `inset(${(1 - heat) * 100}% 0 0 0)`,
              transition: "clip-path 0.15s ease-out",
            }}
          />
        </div>
      </div>
    </div>
  );
}
