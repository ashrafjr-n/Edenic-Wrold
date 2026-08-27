import type { CSSProperties } from "react";
import type { NumberStroke } from "@/types/number-item";
import { strokeLength, strokeToPath } from "@/lib/trace-score";

interface StrokeDemoProps {
  strokes: readonly NumberStroke[];
  accent: string;
}

/** One full cycle: the line draws for the first 62% of it and the finished
    numeral is held for the rest (the split lives in the keyframes, which
    cannot take a variable stop). */
const CYCLE_SECONDS = 3;
/** A multi-stroke numeral staggers, so each stroke starts as the previous one
    finishes drawing. Only number 1 ships today, and it is a single stroke. */
const STAGGER_SECONDS = 1.9;

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
 */
export function StrokeDemo({ strokes, accent }: StrokeDemoProps) {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
      {strokes.map((stroke, index) => {
        const path = strokeToPath(stroke);
        const vars = {
          "--stroke-length": strokeLength(stroke),
          "--stroke-duration": `${CYCLE_SECONDS}s`,
          "--stroke-delay": `${index * STAGGER_SECONDS}s`,
          /* `offset-path` needs a whole `path()` function, not just the `d`. */
          "--pen-path": `path("${path}")`,
        } as CSSProperties;

        return (
          <g key={index}>
            {/* The finished shape, held faintly underneath, so the numeral
                reads as a whole even at the start of each replay. */}
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
          </g>
        );
      })}
    </svg>
  );
}
