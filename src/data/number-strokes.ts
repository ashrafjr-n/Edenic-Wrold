import type { NumberStroke } from "@/types/number-item";

/* ---------------------------------------------------------------
   Handwriting centrelines for 1–9, in a 0–100 square.

   These are the path a child WRITES, not the outline of the clay render on
   the same page. A glyph outline traces around the edge of a numeral and
   doubles back on itself, which is impossible to follow with a finger; a
   centreline is one continuous movement per stroke, which is what tracing
   practice actually is. That is also why they are hand-authored data rather
   than pulled from the font — a font gives contours, never centrelines.

   Written the schoolbook way, so 1 is a flag and a stem with no base serif
   even though the render has one, and 4 is two strokes.

   Coarse on purpose: `sampleStroke()` interpolates them before anything is
   drawn or scored, so more points here would only make them harder to edit.
   --------------------------------------------------------------- */
export const numberStrokes: Record<number, readonly NumberStroke[]> = {
  1: [[[30, 27], [50, 11], [50, 91]]],
  2: [
    [
      [22, 30],
      [31, 16],
      [46, 11],
      [62, 16],
      [70, 31],
      [63, 47],
      [24, 88],
      [77, 88],
    ],
  ],
  3: [
    [
      [24, 22],
      [40, 10],
      [60, 13],
      [70, 27],
      [59, 43],
      [45, 47],
      [62, 50],
      [74, 63],
      [66, 82],
      [45, 90],
      [26, 83],
    ],
  ],
  /* Two strokes: the diagonal-and-bar, then the stem down through it. */
  4: [
    [[64, 12], [20, 66], [82, 66]],
    [[64, 12], [64, 92]],
  ],
  5: [
    [
      [71, 12],
      [33, 12],
      [28, 45],
      [47, 40],
      [66, 47],
      [74, 65],
      [63, 84],
      [42, 90],
      [26, 83],
    ],
  ],
  6: [
    [
      [67, 14],
      [44, 21],
      [30, 42],
      [26, 66],
      [35, 84],
      [54, 90],
      [70, 79],
      [69, 61],
      [55, 52],
      [37, 55],
      [28, 67],
    ],
  ],
  7: [[[24, 14], [76, 14], [46, 92]]],
  /* One crossing figure-eight, the way it is taught — top-left, down through
     the middle, round the bottom, back up and closed. */
  8: [
    [
      [57, 12],
      [39, 16],
      [32, 28],
      [44, 41],
      [59, 51],
      [70, 63],
      [67, 80],
      [51, 90],
      [35, 85],
      [28, 71],
      [37, 58],
      [52, 48],
      [66, 38],
      [70, 24],
      [62, 14],
      [57, 12],
    ],
  ],
  9: [
    [
      [69, 45],
      [54, 53],
      [38, 49],
      [30, 34],
      [39, 18],
      [57, 14],
      [70, 25],
      [72, 47],
      [66, 74],
      [50, 89],
      [34, 92],
    ],
  ],
};
