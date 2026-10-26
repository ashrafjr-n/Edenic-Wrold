import { useId } from "react";
import type { CSSProperties } from "react";
import type { PrintPart, Tracks } from "@/types/course";

/** Ink pressed onto the paper: a dark earth brown. The paper is the same
    cream in both themes (`.chalkboard--stage .pic-card`), so it is fixed. */
const INK = "#3b2f2a";
/** The walk again, bottom print first: the whole trail in about this long. */
const WALK_MS = 900;

function Part({ part }: { part: PrintPart }) {
  const paint = part.w
    ? ({ fill: "none", stroke: INK, strokeWidth: part.w, strokeLinecap: "round", strokeLinejoin: "round" } as const)
    : { fill: INK };
  if ("d" in part) return <path d={part.d} opacity={part.o} {...paint} />;
  const [cx, cy, rx, ry, turn = 0] = part.e;
  return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} transform={turn ? `rotate(${turn} ${cx} ${cy})` : undefined} opacity={part.o} {...paint} />;
}

/**
 * One animal's footprints on a sheet (100×130, walking up it): each print
 * placed, turned and — a left foot — mirrored, in ink with a soft grain, as
 * if pressed. `walk` stamps them in again one after another, bottom first,
 * the tail drawing itself behind — the animal walking it again.
 */
export function TrackSheet({ tracks, walk = false, className = "" }: { tracks: Tracks; walk?: boolean; className?: string }) {
  /* `useId` can hold characters a `url(#…)` will not take. */
  const ink = `ink${useId().replace(/[^\w-]/g, "")}`;
  const gap = WALK_MS / tracks.steps.length;
  return (
    <svg viewBox="0 0 100 130" aria-hidden className={`overflow-visible ${className}`}>
      <defs>
        {/* The grain: a fine noise taken out of the ink's alpha, so it lies
            a little thinner here and there, as ink on paper does. */}
        <filter id={ink} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={3} />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.45 1.12" />
          <feComposite in="SourceGraphic" operator="in" />
        </filter>
      </defs>
      <g filter={`url(#${ink})`}>
        {tracks.drag && (
          <path
            d={tracks.drag.d}
            pathLength={1}
            fill="none"
            stroke={INK}
            strokeWidth={tracks.drag.w}
            strokeLinecap="round"
            opacity={0.3}
            className={walk ? "track-drag" : undefined}
            style={walk ? ({ "--walk": `${WALK_MS}ms` } as CSSProperties) : undefined}
          />
        )}
        {tracks.steps.map(({ at: [x, y], s, r = 0, left, hind }, i) => (
          <g key={i} transform={`translate(${x} ${y}) rotate(${r}) scale(${left ? -s : s} ${s})`}>
            <g className={walk ? "track-stamp" : undefined} style={walk ? { animationDelay: `${Math.round(i * gap)}ms` } : undefined}>
              {((hind && tracks.feet.hind) || tracks.feet.front).map((part, j) => (
                <Part key={j} part={part} />
              ))}
            </g>
          </g>
        ))}
      </g>
    </svg>
  );
}
