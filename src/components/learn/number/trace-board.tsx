"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { NumberStroke, StrokePoint } from "@/types/number-item";
import { scoreTrace, strokeToPath } from "@/lib/trace-score";

interface TraceBoardProps {
  strokes: readonly NumberStroke[];
  accent: string;
  /** How much of the numeral counts as finished this attempt. It drops with
      every miss, which is what guarantees a child gets through eventually. */
  minCoverage: number;
  /** Fired once the child has covered enough of the numeral to be finished. */
  onFinish: (coverage: number) => void;
  /** Fired when a real, committed attempt did not land — a scribble, not a
      child still part-way through drawing. */
  onMiss: () => void;
  /** Frozen once the reward is showing, so the drawing stays on screen. */
  locked: boolean;
}

/** Nothing is committed until the finger has actually travelled — a tap
    should not leave a dot on the board. */
const MIN_STROKE_POINTS = 3;

/** Below this the child is still drawing, so a low score says nothing. Past
    it they have clearly finished something, and if it did not land it is worth
    offering to start over. */
const COMMITTED_POINTS = 55;

/** How long the wrong stroke stays on screen, shaking and red, before it
    clears itself for another try — long enough to register as feedback,
    short enough that a child isn't left waiting to draw again. */
const MISS_FLASH_MS = 550;

export function TraceBoard({
  strokes,
  accent,
  minCoverage,
  onFinish,
  onMiss,
  locked,
}: TraceBoardProps) {
  const surfaceRef = useRef<SVGSVGElement>(null);
  const [drawn, setDrawn] = useState<StrokePoint[][]>([]);
  const [active, setActive] = useState<StrokePoint[]>([]);
  /* True for the brief shake-and-red window right after a committed miss,
     before the board clears itself and the child can draw again. */
  const [missed, setMissed] = useState(false);
  const missTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (missTimeoutRef.current !== null) {
        window.clearTimeout(missTimeoutRef.current);
      }
    };
  }, []);

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
       even a 1, so a part-drawn attempt simply says nothing and waits for the
       next stroke. Only once they have drawn a real amount and still missed
       does Pinki offer to go again. */
    const result = scoreTrace(strokes, finished);
    if (result.coverage >= minCoverage) {
      onFinish(result.coverage);
      return;
    }

    const drawnPoints = finished.reduce((total, s) => total + s.length, 0);
    if (drawnPoints >= COMMITTED_POINTS) {
      /* The wrong stroke shakes and turns red right where it is, then clears
         itself — the child never has to press anything to go again. */
      setMissed(true);
      onMiss();
      missTimeoutRef.current = window.setTimeout(() => {
        setDrawn([]);
        setMissed(false);
        missTimeoutRef.current = null;
      }, MISS_FLASH_MS);
    }
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
      className={`h-full w-full touch-none select-none ${missed ? "anim-wiggle" : ""}`}
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
          strokeDasharray="0 11.5"
        />
      ))}

      {livePaths.map((stroke, index) => (
        <polyline
          key={`drawn-${index}`}
          points={stroke.map(([x, y]) => `${x},${y}`).join(" ")}
          fill="none"
          stroke={missed ? "var(--color-miss)" : accent}
          strokeWidth={9}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}
