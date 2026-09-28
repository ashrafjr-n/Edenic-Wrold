"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { ArrowRight, ChevronRight } from "lucide-react";
import type { Stroke, StrokePoint } from "@/types/stroke";
import { sampleStroke, scoreStroke, strokeToPath } from "@/lib/trace-score";
import type { Dictionary } from "@/lib/dictionaries/en";

interface TraceBoardProps {
  dict: Dictionary["lessonPlayer"];
  /** The shape's centreline — one closed stroke. */
  strokes: readonly Stroke[];
  accent: string;
  /** How much of the shape one stroke has to go round. It eases a little
      with every miss, so a child always gets there. */
  minCoverage: number;
  /** Passed: the stroke the child drew, for the done screen. */
  onFinish: (stroke: StrokePoint[]) => void;
  /** A finished stroke that did not pass. */
  onMiss: () => void;
  /** Frozen once passed: the drawing stays, and the shape fills with colour. */
  locked: boolean;
}

/** How much of the stroke must stay on the line. Fixed — this is what keeps
    a scribble from passing. */
const MIN_ACCURACY = 0.85;

/** Nothing counts until the finger has actually travelled. */
const MIN_STROKE_POINTS = 3;

/** A point is only kept if it is this far (board units) from the last one —
    `pointermove` fires far more often than a finger moves. */
const MIN_POINT_DISTANCE_SQUARED = 0.8 * 0.8;

/** How long a missed stroke stays, red and shaking, before it clears. */
const MISS_FLASH_MS = 550;

/** Where the little direction chevrons sit along the shape. */
const CHEVRONS = [0.25, 0.5, 0.75];

function distanceSquared(a: StrokePoint, b: StrokePoint): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return dx * dx + dy * dy;
}

/** The point `at` (0–1) of the way along a stroke, and the way it is heading. */
function along(stroke: Stroke, at: number): { x: number; y: number; angle: number } {
  const points = sampleStroke(stroke);
  const i = Math.min(points.length - 2, Math.max(0, Math.round(at * (points.length - 1))));
  const [x, y] = points[i];
  const [nx, ny] = points[i + 1];
  return { x, y, angle: (Math.atan2(ny - y, nx - x) * 180) / Math.PI };
}

/** `.clay` as an SVG filter, in board units (the board is ~290px across, so
    one unit is ~2.9px): the grain's frequency is `--noise`'s 0.85/px scaled
    to units, at `--noise`'s 0.62 opacity, blended `overlay`. Two octaves, not
    four — it re-renders on every point of a live stroke, and at this size the
    extra octaves are invisible. The edge colour is the page's accent edge,
    as on the start disc. */
export function ClayFilter({ id }: { id: string }) {
  const edge = { floodColor: "var(--page-accent-edge)" };
  return (
    <filter id={id} x="-15%" y="-15%" width="130%" height="130%" colorInterpolationFilters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="2.5" numOctaves={2} stitchTiles="stitch" result="noise" />
      <feColorMatrix in="noise" type="saturate" values="0" result="grey" />
      <feComponentTransfer in="grey" result="grain">
        <feFuncA type="linear" slope="0" intercept="0.62" />
      </feComponentTransfer>
      <feBlend in="grain" in2="SourceGraphic" mode="overlay" result="grained" />
      <feComposite in="grained" in2="SourceAlpha" operator="in" result="body" />

      {/* The insets: the shape's outside, blurred and nudged in from one side. */}
      <feComponentTransfer in="SourceAlpha" result="outside">
        <feFuncA type="table" tableValues="1 0" />
      </feComponentTransfer>
      <feGaussianBlur in="outside" stdDeviation="1.6" result="outsideBlur" />
      <feOffset in="outsideBlur" dy="2.2" result="fromTop" />
      <feFlood floodColor="#fff" floodOpacity="0.45" />
      <feComposite in2="fromTop" operator="in" />
      <feComposite in2="SourceAlpha" operator="in" result="highlight" />
      <feOffset in="outsideBlur" dy="-2.4" result="fromBottom" />
      <feFlood style={edge} floodOpacity="0.5" />
      <feComposite in2="fromBottom" operator="in" />
      <feComposite in2="SourceAlpha" operator="in" result="shade" />

      <feDropShadow in="SourceAlpha" dx="0" dy="3" stdDeviation="2.4" style={edge} floodOpacity="0.45" result="shadow" />
      <feMerge>
        <feMergeNode in="shadow" />
        <feMergeNode in="body" />
        <feMergeNode in="highlight" />
        <feMergeNode in="shade" />
      </feMerge>
    </filter>
  );
}

/**
 * The tracing board: a dotted shape to go round in ONE stroke.
 *
 * - A clay disc marks where to start, its arrow pointing the way; small
 *   chevrons along the dots show the way round.
 * - Lifting the finger ends the attempt. It passes only if the stroke went
 *   round (almost) all of the shape AND stayed on the line; anything else
 *   flashes red, shakes, and clears itself — there is no second stroke.
 * - Once passed, the shape fills with colour (`.trace-fill`).
 *
 * The markers are lucide icons laid over the SVG, never drawn in it.
 *
 * The child's line and the fill are CLAY, the same as the start disc: the
 * `.clay` recipe (grain blended `overlay`, a white inset from the top, an
 * edge-colour inset from the bottom, a tinted drop shadow) rebuilt as one SVG
 * filter, because a stroke cannot take `background-image` or `box-shadow`.
 */
export function TraceBoard({ strokes, accent, minCoverage, onFinish, onMiss, locked, dict }: TraceBoardProps) {
  const surfaceRef = useRef<SVGSVGElement>(null);
  /* `useId`'s punctuation is not safe inside `url(#…)`. */
  const clayId = `clay${useId().replace(/[^\w-]/g, "")}`;
  const [active, setActive] = useState<StrokePoint[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [missed, setMissed] = useState(false);
  const missTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (missTimer.current !== null) window.clearTimeout(missTimer.current);
    },
    [],
  );

  const toBoardPoint = (event: ReactPointerEvent<SVGSVGElement>): StrokePoint | null => {
    const bounds = surfaceRef.current?.getBoundingClientRect();
    if (!bounds || bounds.width === 0) return null;
    return [
      ((event.clientX - bounds.left) / bounds.width) * 100,
      ((event.clientY - bounds.top) / bounds.height) * 100,
    ];
  };

  const handleDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (locked) return;
    const point = toBoardPoint(event);
    if (!point) return;
    /* Touching during the red flash starts a clean board straight away. */
    if (missTimer.current !== null) {
      window.clearTimeout(missTimer.current);
      missTimer.current = null;
    }
    setMissed(false);
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrawing(true);
    setActive([point]);
  };

  const handleMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (locked || !drawing) return;
    const point = toBoardPoint(event);
    if (!point) return;
    setActive((points) => {
      const last = points[points.length - 1];
      if (last && distanceSquared(last, point) < MIN_POINT_DISTANCE_SQUARED) return points;
      return [...points, point];
    });
  };

  const handleUp = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (locked || !drawing) return;
    /* On `pointercancel` the browser has already released the capture. */
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDrawing(false);

    /* A tap is not an attempt. */
    if (active.length < MIN_STROKE_POINTS) {
      setActive([]);
      return;
    }

    const { coverage, accuracy } = scoreStroke(strokes, active);
    if (coverage >= minCoverage && accuracy >= MIN_ACCURACY) {
      onFinish(active);
      return;
    }

    setMissed(true);
    onMiss();
    missTimer.current = window.setTimeout(() => {
      missTimer.current = null;
      setMissed(false);
      setActive([]);
    }, MISS_FLASH_MS);
  };

  const guidePaths = strokes.map(strokeToPath);
  const start = along(strokes[0], 0);
  const showMarks = !locked && !drawing && !missed;
  const inviting = showMarks && active.length === 0;

  return (
    <div className="relative h-full w-full">
      <svg
        ref={surfaceRef}
        viewBox="0 0 100 100"
        role="img"
        aria-label={dict.traceInstruction}
        /* `touch-action: none`, or the finger scrolls the page instead. */
        className={`h-full w-full touch-none select-none ${missed ? "anim-wiggle" : ""}`}
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerCancel={handleUp}
      >
        <defs>
          <ClayFilter id={clayId} />
        </defs>

        {inviting &&
          guidePaths.map((path, index) => (
            <path
              key={`glow-${index}`}
              className="trace-guide-glow"
              d={path}
              fill="none"
              stroke={accent}
              strokeWidth={20}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

        {!locked &&
          guidePaths.map((path, index) => (
            <path
              key={`guide-${index}`}
              d={path}
              fill="none"
              stroke="var(--color-locked-dark)"
              strokeWidth={9}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="0 11.5"
            />
          ))}

        {/* A missed line stays flat: the red flash is a signal, not clay. */}
        <g filter={missed ? undefined : `url(#${clayId})`}>
          {locked &&
            guidePaths.map((path, index) => (
              <path key={`fill-${index}`} className="trace-fill" d={`${path} Z`} fill={accent} />
            ))}
          {active.length >= MIN_STROKE_POINTS && (
            <polyline
              points={active.map(([x, y]) => `${x},${y}`).join(" ")}
              fill="none"
              stroke={missed ? "var(--color-miss)" : accent}
              strokeWidth={9}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </g>
      </svg>

      {showMarks &&
        CHEVRONS.map((at) => {
          const mark = along(strokes[0], at);
          return (
            <span
              key={at}
              aria-hidden
              className="pointer-events-none absolute flex -translate-x-1/2 -translate-y-1/2 text-[var(--color-ink-soft)]"
              style={{ left: `${mark.x}%`, top: `${mark.y}%`, rotate: `${mark.angle}deg` }}
            >
              <ChevronRight className="h-5 w-5" strokeWidth={3.25} />
            </span>
          );
        })}

      {showMarks && (
        <span
          aria-hidden
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${start.x}%`, top: `${start.y}%` }}
        >
          <span
            className="trace-start clay flex h-11 w-11 items-center justify-center rounded-full text-white sm:h-12 sm:w-12"
            style={{ backgroundColor: accent, "--clay-edge": "var(--page-accent-edge)" } as CSSProperties}
          >
            <ArrowRight className="h-6 w-6" strokeWidth={3} style={{ rotate: `${start.angle}deg` }} />
          </span>
        </span>
      )}
    </div>
  );
}
