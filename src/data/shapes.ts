import type { StaticImageData } from "next/image";
import type { ShapeId } from "@/types/course";
import ball from "../../public/assets/learn/pinki/shapes/find/ball.png";
import toast from "../../public/assets/learn/pinki/shapes/find/toast.png";
import cheese from "../../public/assets/learn/pinki/shapes/find/cheese.png";
import book from "../../public/assets/learn/pinki/shapes/find/book.png";
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
  /** A real thing that is this shape — what a traced shape turns into. From
      the picnic scene, so it is the same world as the Find activity. */
  thing: { src: StaticImageData; word: string };
}

export const SHAPES: Record<ShapeId, ShapeDef> = {
  circle: { strokes: [ring(36, 32)], color: "var(--brand)", thing: { src: ball, word: "ball" } },
  square: {
    strokes: [[[16, 16], [84, 16], [84, 84], [16, 84], [16, 16]]],
    color: "var(--color-go)",
    thing: { src: toast, word: "toast" },
  },
  triangle: {
    strokes: [[[50, 14], [86, 82], [14, 82], [50, 14]]],
    color: "var(--color-gold)",
    thing: { src: cheese, word: "cheese" },
  },
  rectangle: {
    strokes: [[[8, 26], [92, 26], [92, 74], [8, 74], [8, 26]]],
    color: "var(--accent)",
    thing: { src: book, word: "book" },
  },
};
