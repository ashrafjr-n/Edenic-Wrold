import type { NumberStroke, StrokePoint } from "@/types/number-item";

/** Everything below works in the strokes' own 0–100 square. */
const GUIDE_STEP = 1.6;
/** How far off the line a child may be and still count as "on it". Generous
    on purpose: this is a four-year-old with a fingertip, and the reward is
    encouragement, not assessment. */
const TOLERANCE = 10;

/** Below this, the child clearly has not finished yet — keep the pen down and
    say nothing rather than scoring a half-drawn numeral. */
export const MIN_COVERAGE = 0.55;

const THREE_STAR_SCORE = 0.82;
const TWO_STAR_SCORE = 0.6;

export interface TraceResult {
  /** How much of the guide the child actually went over, 0–1. */
  coverage: number;
  /** 1–3. Never 0: finishing at all is the achievement here. */
  stars: number;
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
export function sampleStroke(stroke: NumberStroke): StrokePoint[] {
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
  return candidates.some(
    (candidate) => distanceSquared(point, candidate) <= limit,
  );
}

/**
 * Compares what the child drew against the numeral's guide.
 *
 * Two halves, because either one alone is easy to cheat: COVERAGE asks how
 * much of the numeral was travelled (scribbling in one corner scores badly),
 * ACCURACY asks how much of the drawing stayed on it (scribbling over the
 * whole box scores badly). Coverage weighs more — a child who follows the
 * shape but wanders should still be praised.
 */
export function scoreTrace(
  guideStrokes: readonly NumberStroke[],
  drawn: readonly StrokePoint[][],
): TraceResult {
  const guidePoints = guideStrokes.flatMap(sampleStroke);
  const drawnPoints = drawn.flat();

  if (guidePoints.length === 0 || drawnPoints.length === 0) {
    return { coverage: 0, stars: 1 };
  }

  const covered = guidePoints.filter((point) =>
    isNear(point, drawnPoints),
  ).length;
  const onGuide = drawnPoints.filter((point) =>
    isNear(point, guidePoints),
  ).length;

  const coverage = covered / guidePoints.length;
  const accuracy = onGuide / drawnPoints.length;
  const score = coverage * 0.65 + accuracy * 0.35;

  const stars =
    score >= THREE_STAR_SCORE ? 3 : score >= TWO_STAR_SCORE ? 2 : 1;

  return { coverage, stars };
}

/** The `d` of an SVG path following a stroke's corners. */
export function strokeToPath(stroke: NumberStroke): string {
  return stroke
    .map(([x, y], index) => `${index === 0 ? "M" : "L"}${x} ${y}`)
    .join(" ");
}
