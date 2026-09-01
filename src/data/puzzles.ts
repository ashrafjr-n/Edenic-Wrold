import type { PuzzleStage } from "@/types/puzzle";

/** Every puzzle is a 3 × 3 grid. The nine pieces are cut out of ONE image by
    CSS (see `lib/puzzle-pieces.ts`) — not nine separate files, and not an
    SVG — the same sprite-crop trick `NumberComplete` already uses. */
export const PUZZLE_COLS = 3;
export const PUZZLE_ROWS = 3;
export const PUZZLE_PIECES = PUZZLE_COLS * PUZZLE_ROWS;

/** Nine stages. Only the first has its picture so far; the rest are declared
    so the grid can show the shape of the whole set, the same way the numbers
    lesson lists 1–9 with only the first fully built. */
export const puzzleStages: PuzzleStage[] = [
  {
    value: 1,
    picture: {
      src: "/assets/activity-page/puzzle/1/puzzle-1.jpg",
      width: 1376,
      height: 768,
      alt: "Pinki, Nova and Bloo drawing together at a little table",
    },
  },
  { value: 2 },
  { value: 3 },
  { value: 4 },
  { value: 5 },
  { value: 6 },
  { value: 7 },
  { value: 8 },
  { value: 9 },
];

export function findPuzzleStage(value: number): PuzzleStage | undefined {
  return puzzleStages.find((stage) => stage.value === value);
}
