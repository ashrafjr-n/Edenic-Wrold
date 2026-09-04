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

/** A new point is only kept if it's at least this far (board units, out of
    100) from the last one. `pointermove` can fire dozens of times a second
    even while a finger barely moves, and every one of those was landing in
    `active` unfiltered — a slow or hesitant trace (exactly the numerals with
    longer strokes, like 3 or 8) could pile up thousands of near-duplicate
    points. Since scoring and re-rendering both cost roughly O(point count),
    and every `setActive` call was already re-copying the whole array, that
    is real O(n²) work piling up mid-stroke — the actual cause of the
    reported freezing/lag while drawing, not a one-off glitch. */
const MIN_POINT_DISTANCE = 0.8;
const MIN_POINT_DISTANCE_SQUARED = MIN_POINT_DISTANCE * MIN_POINT_DISTANCE;

function distanceSquared(a: StrokePoint, b: StrokePoint): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return dx * dx + dy * dy;
}

/** After the pen lifts on an attempt that did NOT pass, the child gets this
    long to carry on before it is judged — a 4 is two strokes and a small
    child pauses between them, so a numeral must never be failed mid-way.
    Starting another stroke cancels the pending judgement outright.

    This replaced a raw "has drawn at least N points" threshold, which was
    the wrong measure twice over: it never fired at all for a small wrong
    scribble (so a failed attempt just sat there, with no red, no clearing
    and no way on except pressing "Try Again"), and its calibration silently
    depended on how many `pointermove` events the device happened to fire. */
const JUDGE_DELAY_MS = 1400;

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
  /* The pending "has the child stopped drawing yet?" judgement. */
  const judgeTimeoutRef = useRef<number | null>(null);

  const cancelJudge = useCallback(() => {
    if (judgeTimeoutRef.current !== null) {
      window.clearTimeout(judgeTimeoutRef.current);
      judgeTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (missTimeoutRef.current !== null) {
        window.clearTimeout(missTimeoutRef.current);
      }
      if (judgeTimeoutRef.current !== null) {
        window.clearTimeout(judgeTimeoutRef.current);
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

    /* Still working — whatever is drawn so far must not be judged yet. */
    cancelJudge();

    /* Touching during the red miss flash skips the rest of it and starts a
       clean board immediately, rather than making the child wait it out. */
    if (missed) {
      if (missTimeoutRef.current !== null) {
        window.clearTimeout(missTimeoutRef.current);
        missTimeoutRef.current = null;
      }
      setMissed(false);
      setDrawn([]);
    }

    /* Capture, so a finger that slides off the board keeps drawing instead of
       silently ending the stroke mid-numeral. */
    event.currentTarget.setPointerCapture(event.pointerId);
    setActive([point]);
  };

  const handleMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (locked || active.length === 0) return;
    const point = toBoardPoint(event);
    if (!point) return;

    setActive((points) => {
      const last = points[points.length - 1];
      /* Returning the SAME array (not a copy) when the point is too close
         also lets React skip the re-render entirely for that event. */
      if (last && distanceSquared(last, point) < MIN_POINT_DISTANCE_SQUARED) {
        return points;
      }
      return [...points, point];
    });
  };

  const handleUp = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (locked || active.length === 0) return;
    /* Guarded: on `pointercancel` the browser has ALREADY released the
       capture, and releasing it again throws `NotFoundError` — which used to
       abort this handler before it could clear `active`, leaving the board in
       a state where moving the pointer kept drawing with nothing pressed. */
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const finished = active.length >= MIN_STROKE_POINTS ? [...drawn, active] : drawn;
    setDrawn(finished);
    setActive([]);

    /* Nothing real on the board yet — a stray tap is not an attempt. */
    if (finished.length === 0) return;

    /* Scored on every pen-up rather than behind a "Done" button: a numeral
       like 4 takes two strokes, so passing is checked immediately but FAILING
       waits — the child gets `JUDGE_DELAY_MS` to carry on before the attempt
       is called a miss, and any new stroke cancels that judgement. */
    const result = scoreTrace(strokes, finished);
    if (result.coverage >= minCoverage) {
      onFinish(result.coverage);
      return;
    }

    cancelJudge();
    judgeTimeoutRef.current = window.setTimeout(() => {
      judgeTimeoutRef.current = null;
      /* The wrong stroke shakes and turns red right where it is, then clears
         itself — the child never has to press anything to go again. */
      setMissed(true);
      onMiss();
      missTimeoutRef.current = window.setTimeout(() => {
        setDrawn([]);
        setMissed(false);
        missTimeoutRef.current = null;
      }, MISS_FLASH_MS);
    }, JUDGE_DELAY_MS);
  };

  const guidePaths = strokes.map(strokeToPath);
  const livePaths = [...drawn, active].filter(
    (stroke) => stroke.length >= MIN_STROKE_POINTS,
  );

  /* The invitation to start, and only that: a halo under the dots while the
     board is still blank. The moment the child puts a finger down the thing
     worth looking at is their own line, so it goes — a glow under a stroke
     being drawn competes with it instead of guiding it. It stays away once
     the trace is passed, too. */
  const inviting = !locked && drawn.length === 0 && active.length === 0;

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
      {/* Under the dots, never over them: a much wider copy of the very same
          path, breathing in the character's accent. Drawn from `guidePaths`
          rather than a second definition so the halo can never sit anywhere
          but exactly on the line the child is being asked to follow. */}
      {inviting &&
        guidePaths.map((path, index) => (
          <path
            key={`guide-glow-${index}`}
            className="trace-guide-glow"
            d={path}
            fill="none"
            stroke={accent}
            strokeWidth={20}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

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
