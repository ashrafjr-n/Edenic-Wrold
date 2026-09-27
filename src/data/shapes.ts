import type { ShapeId } from "@/types/course";
import type { Stroke } from "@/types/stroke";

/** A closed ring of points around (50, 50) — the circle's centreline. */
function ring(radius: number, points: number): Stroke {
  return Array.from({ length: points + 1 }, (_, i) => {
    const angle = -Math.PI / 2 + (i / points) * Math.PI * 2;
    return [
      Math.round((50 + radius * Math.cos(angle)) * 10) / 10,
      Math.round((50 + radius * Math.sin(angle)) * 10) / 10,
    ] as const;
  });
}

interface ShapeDef {
  /** The CENTRELINE a child traces, one stroke, in a 0–100 square — the same
      format and scorer the old numerals used (`lib/trace-score.ts`). Also
      what `ShapeFigure` fills, so the shape a child sees and the shape they
      trace can never disagree. */
  strokes: readonly Stroke[];
  /** Its clay colour on a tile. */
  color: string;
}

export const SHAPES: Record<ShapeId, ShapeDef> = {
  circle: { strokes: [ring(36, 32)], color: "var(--brand)" },
  square: {
    strokes: [[[16, 16], [84, 16], [84, 84], [16, 84], [16, 16]]],
    color: "var(--color-go)",
  },
  triangle: {
    strokes: [[[50, 14], [86, 82], [14, 82], [50, 14]]],
    color: "var(--color-gold)",
  },
  rectangle: {
    strokes: [[[8, 26], [92, 26], [92, 74], [8, 74], [8, 26]]],
    color: "var(--accent)",
  },
};
