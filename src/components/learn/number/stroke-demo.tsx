import type { CSSProperties } from "react";
import type { NumberStroke } from "@/types/number-item";
import { strokeLength, strokeToPath } from "@/lib/trace-score";

interface StrokeDemoProps {
  strokes: readonly NumberStroke[];
  accent: string;
}

/** One full cycle: the line draws for the first 62% of it and the finished
    numeral is held for the rest (the split lives in the keyframes, which
    cannot take a variable stop). A two-stroke numeral gets longer, so the
    hand does not have to race to fit both into number 1's three seconds. */
const CYCLE_SECONDS = 3;
const EXTRA_PER_STROKE = 1.2;

/**
 * The numeral drawing itself, over and over, along the same centrelines the
 * child is about to trace.
 *
 * Reusing the trace data is the point: a demonstration that disagreed with the
 * guide underneath the child's finger would teach the wrong movement. It is a
 * `stroke-dashoffset` animation, so the line genuinely draws rather than
 * fading in, and a pencil tip rides the identical path via `offset-path`.
 *
 * It loops instead of playing once — a child who looks away has not missed it,
 * and there is nothing to press to see it again.
 *
 * **Every stroke is ONE path with a `M` between them, not one animation per
 * stroke.** The per-stroke version staggered with `animation-delay` on a
 * shared three-second loop, which is coherent for a one-stroke numeral and
 * nonsense for any other: the second stroke's delay (1.9s) was not a factor
 * of the period, so it was still drawing when the first restarted and the
 * numeral never once appeared whole. Number 4 was the first two-stroke
 * numeral to ship, and that is exactly what it looked like. A single dashed
 * path solves it by construction — a `moveto` has no length, so the dash
 * offset runs straight from the end of one stroke to the start of the next,
 * drawing them in order with one animation and no timing to keep in step.
 * The pen rides the same combined path and lifts across the gap, which is
 * what a hand does anyway.
 */
export function StrokeDemo({ strokes, accent }: StrokeDemoProps) {
  const path = strokes.map(strokeToPath).join(" ");
  const length = strokes.reduce((total, stroke) => total + strokeLength(stroke), 0);
  const vars = {
    "--stroke-length": length,
    "--stroke-duration": `${CYCLE_SECONDS + (strokes.length - 1) * EXTRA_PER_STROKE}s`,
    "--stroke-delay": "0s",
    /* `offset-path` needs a whole `path()` function, not just the `d`. */
    "--pen-path": `path("${path}")`,
  } as CSSProperties;

  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
      {/* The finished shape, held faintly underneath, so the numeral reads as
          a whole even at the start of each replay. */}
      <path
        d={path}
        fill="none"
        stroke="var(--color-locked)"
        strokeWidth={9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        className="stroke-draw"
        style={vars}
        d={path}
        fill="none"
        stroke={accent}
        strokeWidth={9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle className="pen-tip" style={vars} r={5.5} fill={accent} />
    </svg>
  );
}
