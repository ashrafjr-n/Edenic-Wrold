"use client";

import { useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import Image from "next/image";
import { Paintbrush } from "lucide-react";
import type { NumberStroke, StrokePoint } from "@/types/number-item";
import { scoreTrace } from "@/lib/trace-score";

interface NumberColorProps {
  value: number;
  image: string;
  /** The numeral's handwriting centrelines — reused here purely as the yardstick
      for "how much of the numeral has been coloured in". */
  strokes: readonly NumberStroke[];
  /** The crayon's colour. */
  accent: string;
  onFinish: () => void;
}

/** How thick the crayon is, in the board's own 0–100 units. Deliberately fat:
    this is colouring in, not tracing a line. */
const BRUSH = 14;
/** A dab has to be a dab — one stray point is not a stroke. */
const MIN_STROKE_POINTS = 2;

/** Same fix as `TraceBoard`'s own `MIN_POINT_DISTANCE`: a new point is only
    kept if it's at least this far (board units, out of 100) from the last
    one, so scrubbing the crayon slowly back and forth — which is how
    colouring in actually happens, more so than tracing — can't pile up
    thousands of near-duplicate points into `active` and make `scoreTrace`
    (and every re-render in between) increasingly expensive mid-stroke. */
const MIN_POINT_DISTANCE = 0.8;
const MIN_POINT_DISTANCE_SQUARED = MIN_POINT_DISTANCE * MIN_POINT_DISTANCE;

function distanceSquared(a: StrokePoint, b: StrokePoint): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return dx * dx + dy * dy;
}
/** How much of the numeral has to be covered to count as coloured in.
    Measured the same way `TraceBoard` measures a trace, against the same
    centrelines, so "coloured most of the number" is what actually passes. */
const COLOR_COVERAGE = 0.72;
/** Long enough to watch the finished numeral arrive under the colouring. */
const FINISH_MS = 420;

/**
 * "Color Number 6!" — the numeral starts as an empty outline and the child
 * colours it in with a crayon.
 *
 * **Colouring outside the lines is impossible by construction**, which is the
 * whole point: the layer carrying the child's strokes is masked by the
 * numeral's own alpha (`.numeral-mask`), so paint that strays off the glyph
 * simply has nowhere to land. Nobody has to be careful, and nobody is ever
 * told they went over the edge.
 *
 * Progress is scored with `scoreTrace` against the numeral's centrelines —
 * the same yardstick the tracing stage uses — so filling the shape in is what
 * finishes it, not scrubbing one corner. When it's done the real clay numeral
 * fades in over the crayon, as the reward for having coloured it.
 */
export function NumberColor({
  value,
  image,
  strokes,
  accent,
  onFinish,
}: NumberColorProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const finishedRef = useRef(false);

  const [painted, setPainted] = useState<StrokePoint[][]>([]);
  const [active, setActive] = useState<StrokePoint[]>([]);
  const [done, setDone] = useState(false);

  const maskStyle = { "--numeral-mask": `url("${image}")` } as CSSProperties;
  const hasPainted = painted.length > 0 || active.length > 0;

  /* Client pixels → the strokes' own 0–100 square, exactly as `TraceBoard`
     does it, so the coverage score means the same thing in both places. */
  const toBoardPoint = (
    event: ReactPointerEvent<HTMLDivElement>,
  ): StrokePoint | null => {
    const bounds = boardRef.current?.getBoundingClientRect();
    if (!bounds || bounds.width === 0) return null;
    return [
      ((event.clientX - bounds.left) / bounds.width) * 100,
      ((event.clientY - bounds.top) / bounds.height) * 100,
    ];
  };

  const handleDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (done) return;
    const point = toBoardPoint(event);
    if (!point) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setActive([point]);
  };

  const handleMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (done || active.length === 0) return;
    const point = toBoardPoint(event);
    if (!point) return;
    setActive((points) => {
      const last = points[points.length - 1];
      if (last && distanceSquared(last, point) < MIN_POINT_DISTANCE_SQUARED) {
        return points;
      }
      return [...points, point];
    });
  };

  const handleUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (done || active.length === 0) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const finished =
      active.length >= MIN_STROKE_POINTS ? [...painted, active] : painted;
    setPainted(finished);
    setActive([]);

    /* Scored when the crayon lifts rather than on every move: the check is
       cheap but pointless mid-stroke, and this is also the natural moment for
       the numeral to arrive. */
    if (finishedRef.current) return;
    if (scoreTrace(strokes, finished).coverage >= COLOR_COVERAGE) {
      finishedRef.current = true;
      setDone(true);
      window.setTimeout(onFinish, FINISH_MS);
    }
  };

  const liveStrokes = [...painted, active].filter(
    (stroke) => stroke.length >= MIN_STROKE_POINTS,
  );

  return (
    <div className="card numeral-stage anim-rise-in flex flex-col items-center p-5 sm:p-7">
      <div
        ref={boardRef}
        className="relative touch-none select-none"
        style={{ width: "var(--board-w)", height: "var(--board-h)" }}
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerCancel={handleUp}
        role="img"
        aria-label={`Color in the number ${value}`}
      >
        {/* The empty outline. A pale fill masked to the numeral, with the rim
            drawn by four offset shadows on the wrapper — offsetting the masked
            shape in four directions is what puts an even outline around every
            edge, the inner counters of a 6 or an 8 included. */}
        <span
          className={`absolute inset-0 transition-opacity duration-500 ${
            done ? "opacity-0" : "opacity-100"
          }`}
          style={{
            filter:
              "drop-shadow(1.5px 0 0 var(--color-locked-text)) drop-shadow(-1.5px 0 0 var(--color-locked-text)) drop-shadow(0 1.5px 0 var(--color-locked-text)) drop-shadow(0 -1.5px 0 var(--color-locked-text))",
          }}
          aria-hidden
        >
          <span
            className="numeral-mask block h-full w-full bg-[var(--color-locked)]"
            style={maskStyle}
          />
        </span>

        {/* The crayon itself. Masked to the numeral, so going over the edge
            costs nothing — the paint only ever appears on the number. */}
        <span
          className="numeral-mask absolute inset-0 block"
          style={maskStyle}
          aria-hidden
        >
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="h-full w-full"
          >
            {liveStrokes.map((stroke, index) => (
              <polyline
                key={index}
                points={stroke.map(([x, y]) => `${x},${y}`).join(" ")}
                fill="none"
                stroke={accent}
                strokeWidth={BRUSH}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </svg>
        </span>

        {/* The finished numeral, as the reward for colouring it in. */}
        <Image
          src={image}
          alt=""
          fill
          sizes="(min-width: 640px) 11rem, 9rem"
          draggable={false}
          className={`select-none object-contain transition-opacity duration-500 ${
            done ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* The crayon, sitting on the number until the child picks it up —
            an unlabelled outline says nothing about what to do with it. */}
        {!hasPainted && (
          <span
            className="anim-pulse-invite pointer-events-none absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--surface)] shadow-[0_10px_20px_-8px_rgb(var(--shadow-hue)/45%)] sm:h-16 sm:w-16"
            aria-hidden
          >
            <Paintbrush
              className="h-7 w-7 sm:h-8 sm:w-8"
              style={{ color: accent }}
              strokeWidth={2.25}
            />
          </span>
        )}
      </div>
    </div>
  );
}
