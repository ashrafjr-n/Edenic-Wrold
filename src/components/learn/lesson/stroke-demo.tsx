import type { CSSProperties } from "react";
import type { Stroke } from "@/types/stroke";
import { strokeLength, strokeToPath } from "@/lib/trace-score";

interface StrokeDemoProps {
  strokes: readonly Stroke[];
  accent: string;
}

/** One full cycle: the line draws for the first 62% of it and the finished
    shape is held for the rest (the split lives in the keyframes, which
    cannot take a variable stop). Each extra stroke lengthens the cycle, so
    the hand never has to race. */
const CYCLE_SECONDS = 3;
const EXTRA_PER_STROKE = 1.2;

/**
 * The shape drawing itself, over and over, along the same centreline the
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
 * **One `<path>` PER STROKE, sharing one animation.** Every shape today is one
 * stroke, but the drawing stays correct for more: staggering strokes with
 * `animation-delay` falls out of step with the loop, and joining them into one
 * path with a `moveto` restarts the dash pattern at every subpath, so they all
 * draw at once. Instead every path dashes on the WHOLE drawing's length and
 * starts as far back as there is drawing before it (`--stroke-offset`, see
 * the `stroke-draw` keyframes in `globals.css`) — one animation, one period.
 *
 * The pen rides the combined path and lifts across any gap between strokes.
 */
export function StrokeDemo({ strokes, accent }: StrokeDemoProps) {
  const segments = strokes.map(strokeToPath);
  /* The whole drawing as one `d` — what the faint shape underneath is drawn
     from, and what the pen travels. Only the drawing line is split. */
  const path = segments.join(" ");

  /* How much drawing comes BEFORE each stroke, and how much there is in
     total. Resolved here rather than in the markup: the offsets are a running
     sum, which is not something a `map` in JSX can express honestly — and the
     two dash ends below have to be finished NUMBERS by the time they reach
     CSS, because a `calc()` in a keyframe does not interpolate (see the
     `stroke-draw` keyframes in `globals.css`). */
  const offsets: number[] = [];
  let length = 0;
  for (const stroke of strokes) {
    offsets.push(length);
    length += strokeLength(stroke);
  }

  const vars = {
    "--stroke-length": length,
    "--stroke-duration": `${CYCLE_SECONDS + (strokes.length - 1) * EXTRA_PER_STROKE}s`,
    "--stroke-delay": "0s",
    /* `offset-path` needs a whole `path()` function, not just the `d`. */
    "--pen-path": `path("${path}")`,
  } as CSSProperties;

  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
      {/* The finished shape, held faintly underneath, so the shape reads as
          a whole even at the start of each replay. */}
      <path
        d={path}
        fill="none"
        stroke="var(--color-locked)"
        strokeWidth={9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* The key is the index on purpose: a shape's strokes are fixed data
          that never reorders, and there is nothing else stable to key on. */}
      {segments.map((segment, index) => (
        <path
          key={index}
          className="stroke-draw"
          style={
            {
              ...vars,
              /* Hidden until the pen has drawn everything before this stroke,
                 complete the moment it has drawn this one too. */
              "--stroke-from": length + offsets[index],
              "--stroke-to": offsets[index],
            } as CSSProperties
          }
          d={segment}
          fill="none"
          stroke={accent}
          strokeWidth={9}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}

      <circle className="pen-tip" style={vars} r={5.5} fill={accent} />
    </svg>
  );
}
