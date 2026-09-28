import type { Stroke, StrokePoint } from "@/types/stroke";

/** Everything below works in the strokes' own 0–100 square. */
const GUIDE_STEP = 1.6;
/** How far off the line a point may be and still count as ON it. The dotted
    guide is 9 wide, so this is about a finger's width either side of it. */
const TOLERANCE = 8;

export interface TraceScore {
  /** How much of the shape the stroke went round, 0–1. */
  coverage: number;
  /** How much of the stroke stayed on the shape, 0–1. */
  accuracy: number;
}

function distanceSquared(a: StrokePoint, b: StrokePoint): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return dx * dx + dy * dy;
}

/** Walks a stroke's corners and drops a point every `GUIDE_STEP`, so scoring
    measures the LINE rather than the handful of corners that describe it —
    otherwise a long straight segment would count for as little as a tight
    curve. Also what the dotted guide is drawn from, so the two can never
    disagree about where the line is. */
export function sampleStroke(stroke: Stroke): StrokePoint[] {
  const sampled: StrokePoint[] = [];

  for (let i = 0; i < stroke.length - 1; i += 1) {
    const from = stroke[i];
    const to = stroke[i + 1];
    const length = Math.sqrt(distanceSquared(from, to));
    const steps = Math.max(1, Math.round(length / GUIDE_STEP));

    for (let step = 0; step < steps; step += 1) {
      const t = step / steps;
      sampled.push([
        from[0] + (to[0] - from[0]) * t,
        from[1] + (to[1] - from[1]) * t,
      ]);
    }
  }

  const last = stroke[stroke.length - 1];
  if (last) sampled.push(last);

  return sampled;
}

function isNear(point: StrokePoint, candidates: StrokePoint[]): boolean {
  const limit = TOLERANCE * TOLERANCE;
  return candidates.some((candidate) => distanceSquared(point, candidate) <= limit);
}

/**
 * Scores ONE stroke against the shape. Two halves, because either alone is
 * easy to cheat: COVERAGE asks how much of the shape was travelled (half a
 * circle scores half), ACCURACY asks how much of the stroke stayed on it (a
 * scribble over the whole board covers everything but is mostly off the
 * line). The board asks for both to be high.
 */
export function scoreStroke(guideStrokes: readonly Stroke[], drawn: readonly StrokePoint[]): TraceScore {
  const guidePoints = guideStrokes.flatMap(sampleStroke);
  const drawnPoints = sampleStroke(drawn);
  if (guidePoints.length === 0 || drawnPoints.length < 2) return { coverage: 0, accuracy: 0 };

  return {
    coverage: guidePoints.filter((point) => isNear(point, drawnPoints)).length / guidePoints.length,
    accuracy: drawnPoints.filter((point) => isNear(point, guidePoints)).length / drawnPoints.length,
  };
}

/** How long a stroke is, in the strokes' own 0–100 units. Used to set the
    dash length that makes the shape draw itself in `StrokeDemo`. */
export function strokeLength(stroke: Stroke): number {
  let total = 0;
  for (let i = 0; i < stroke.length - 1; i += 1) {
    total += Math.sqrt(distanceSquared(stroke[i], stroke[i + 1]));
  }
  return total;
}

/** The `d` of an SVG path following a stroke's corners. */
export function strokeToPath(stroke: Stroke): string {
  return stroke
    .map(([x, y], index) => `${index === 0 ? "M" : "L"}${x} ${y}`)
    .join(" ");
}
