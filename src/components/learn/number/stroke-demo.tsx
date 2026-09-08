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
 * **One `<path>` PER STROKE, sharing one animation — not one path holding
 * them all, and not one animation per stroke either.** Both of those have
 * shipped here and both drew number 4 wrong:
 *
 * - Staggering with `animation-delay` on a shared three-second loop is
 *   coherent for a one-stroke numeral and nonsense for any other — the second
 *   stroke's delay was not a factor of the period, so it was still drawing
 *   when the first restarted and the numeral never once appeared whole.
 * - Joining every stroke into ONE path with a `moveto` between them looks
 *   like it fixes that by construction, since a `moveto` has no length. It
 *   does not: **the dash pattern restarts at every subpath**, so each stroke
 *   got its own copy of the same offset and they all drew AT THE SAME TIME.
 *   Number 4 is the only numeral with two strokes, which is why it was the
 *   only one that looked wrong.
 *
 * What actually sequences them is `--stroke-offset` (see the `stroke-draw`
 * keyframes in `globals.css`): every path dashes on the WHOLE numeral's
 * length and starts its own dash as far back as there is numeral before it,
 * so a stroke is invisible until the pen reaches it and complete the moment
 * the pen leaves. One animation, one period, nothing to keep in step.
 *
 * The pen rides the combined path and lifts across the gap between strokes,
 * which is what a hand does anyway.
 */
export function StrokeDemo({ strokes, accent }: StrokeDemoProps) {
  const segments = strokes.map(strokeToPath);
  /* The whole numeral as one `d` — what the faint shape underneath is drawn
     from, and what the pen travels. Only the drawing line is split. */
  const path = segments.join(" ");

  /* How much numeral comes BEFORE each stroke, and how much there is in
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

      {/* The key is the index on purpose: a numeral's strokes are fixed data
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
