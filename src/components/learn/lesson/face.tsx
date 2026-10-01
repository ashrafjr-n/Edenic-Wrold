import { useId } from "react";
import Image from "next/image";
import { SHAPES } from "@/data/shapes";
import { strokeToPath } from "@/lib/trace-score";
import type { Face } from "@/types/course";
import { ClayFilter } from "./trace-board";

interface FaceViewProps {
  face: Face;
  /** `tile` fills an answer tile; `inline` is one token in a row ("2 🍎 + 1 🍎"). */
  size: "tile" | "inline";
}

/**
 * One thing to look at: a clay picture, a taught shape, or text.
 *
 * **A shape is drawn from its own tracing centreline** (`data/shapes.ts`), so
 * the circle on a tile and the circle a child traces are the same circle. It
 * is geometry being taught, not an icon. It is CLAY, like everything a child
 * touches here: a thick stroke of its own colour rounds the corners (the
 * outline stays a true circle, square, triangle, rectangle) and the trace
 * board's `ClayFilter` — grain, a light inset from the top, a shade from the
 * bottom in the shape's edge colour, a drop shadow — at a depth made for a
 * filled shape rather than a line. A `picture` face replaces it with no
 * other change.
 */
export function FaceView({ face, size }: FaceViewProps) {
  const clayId = `shape${useId().replace(/[^\w-]/g, "")}`;
  if (face.kind === "text") {
    return (
      <span
        className={`font-bold leading-none text-[var(--color-ink)] ${
          size === "tile" ? "text-5xl sm:text-6xl" : "text-3xl sm:text-4xl"
        }`}
      >
        {face.text}
      </span>
    );
  }

  const box = size === "tile" ? "h-[62%] w-[62%]" : "h-10 w-10 sm:h-14 sm:w-14";

  if (face.kind === "picture") {
    return (
      <Image
        src={face.src}
        alt={face.word}
        sizes={size === "tile" ? "(min-width: 640px) 120px, 80px" : "(min-width: 640px) 56px, 40px"}
        className={`${box} object-contain`}
      />
    );
  }

  const shape = SHAPES[face.shape];
  return (
    <span className={box}>
      <svg viewBox="0 0 100 100" overflow="visible" className="h-full w-full" role="img" aria-label={face.shape}>
        <defs>
          <ClayFilter id={clayId} edge={shape.edge} depth={2.4} />
        </defs>
        <path
          d={shape.strokes.map(strokeToPath).join(" ")}
          fill={shape.color}
          stroke={shape.color}
          strokeWidth="12"
          strokeLinejoin="round"
          filter={`url(#${clayId})`}
        />
      </svg>
    </span>
  );
}
