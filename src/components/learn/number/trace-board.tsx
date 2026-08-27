"use client";

import { useCallback, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { NumberStroke, StrokePoint } from "@/types/number-item";
import { MIN_COVERAGE, scoreTrace, strokeToPath } from "@/lib/trace-score";

interface TraceBoardProps {
  strokes: readonly NumberStroke[];
  accent: string;
  /** Fired once the child has covered enough of the numeral to be finished. */
  onFinish: (stars: number) => void;
  /** Frozen once the reward is showing, so the drawing stays on screen. */
  locked: boolean;
}

/** Nothing is committed until the finger has actually travelled — a tap
    should not leave a dot on the board. */
const MIN_STROKE_POINTS = 3;

export function TraceBoard({
  strokes,
  accent,
  onFinish,
  locked,
}: TraceBoardProps) {
  const surfaceRef = useRef<SVGSVGElement>(null);
  const [drawn, setDrawn] = useState<StrokePoint[][]>([]);
  const [active, setActive] = useState<StrokePoint[]>([]);

  /* Client pixels → the strokes' own 0–100 square, so the score means the
     same thing whatever the board is sized to. */
  const toBoardPoint = useCallback(
    (event: ReactPointerEvent<SVGSVGElement>): StrokePoint | null => {
      const bounds = surfaceRef.current?.getBoundingClientRect();
      if (!bounds || bounds.width === 0) return null;

      return [
        ((event.clientX - bounds.left) / bounds.width) * 100,
        ((event.clientY - bounds.top) / bounds.height) * 100,
      ];
    },
    [],
  );

  const handleDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (locked) return;
    const point = toBoardPoint(event);
    if (!point) return;

    /* Capture, so a finger that slides off the board keeps drawing instead of
       silently ending the stroke mid-numeral. */
    event.currentTarget.setPointerCapture(event.pointerId);
    setActive([point]);
  };

  const handleMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (locked || active.length === 0) return;
    const point = toBoardPoint(event);
    if (!point) return;

    setActive((points) => [...points, point]);
  };

  const handleUp = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (locked || active.length === 0) return;
    event.currentTarget.releasePointerCapture(event.pointerId);

    const finished = active.length >= MIN_STROKE_POINTS ? [...drawn, active] : drawn;
    setDrawn(finished);
    setActive([]);

    /* Scored on every pen-up rather than behind a "Done" button: a numeral
       like 4 takes two strokes and a small child will lift mid-way through
       even a 1, so an unfinished attempt simply says nothing and waits for
       the next stroke. */
    const result = scoreTrace(strokes, finished);
    if (result.coverage >= MIN_COVERAGE) onFinish(result.stars);
  };

  const guidePaths = strokes.map(strokeToPath);
  const livePaths = [...drawn, active].filter(
    (stroke) => stroke.length >= MIN_STROKE_POINTS,
  );

  return (
    <svg
      ref={surfaceRef}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Trace the number with your finger"
      /* `touch-action: none` is what stops a drag from scrolling the page
         instead of drawing — the whole activity depends on it. */
      className="h-full w-full touch-none select-none"
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      onPointerCancel={handleUp}
    >
      {guidePaths.map((path, index) => (
        <path
          key={`guide-${index}`}
          d={path}
          fill="none"
          stroke="var(--color-locked-dark)"
          strokeWidth={9}
          strokeLinecap="round"
          strokeLinejoin="round"
          /* Round caps on a zero-length dash: the guide reads as a row of
             dots, not as a chopped-up line. */
          strokeDasharray="0 13"
        />
      ))}

      {livePaths.map((stroke, index) => (
        <polyline
          key={`drawn-${index}`}
          points={stroke.map(([x, y]) => `${x},${y}`).join(" ")}
          fill="none"
          stroke={accent}
          strokeWidth={9}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}
