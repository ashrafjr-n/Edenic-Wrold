import type { PuzzleStage, PuzzleTone } from "@/types/puzzle";

/** A colour each, so a wall of nine unopened puzzles reads as nine different
    things to look forward to rather than one grid of grey. Every pair is an
    existing site token — no new hues — laid out so no two neighbours in the
    3 × 3 grid share a family. */
const TONES: PuzzleTone[] = [
  { face: "var(--color-pinki)", edge: "var(--color-pinki-dark)" },
  { face: "var(--color-bloo)", edge: "var(--color-bloo-dark)" },
  { face: "var(--color-gold)", edge: "var(--color-gold-dark)" },
  { face: "var(--color-nova)", edge: "var(--color-nova-dark)" },
  { face: "var(--color-go)", edge: "var(--color-go-dark)" },
  { face: "var(--color-subject-shapes)", edge: "var(--color-subject-shapes-dark)" },
  { face: "var(--brand)", edge: "var(--brand-dark)" },
  { face: "var(--color-subject-letters)", edge: "var(--color-subject-letters-dark)" },
  { face: "var(--accent)", edge: "var(--accent-dark)" },
];

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
    tone: TONES[0],
    picture: {
      src: "/assets/activity-page/puzzle/1/puzzle-1.jpg",
      width: 1376,
      height: 768,
      alt: "Pinki, Nova and Bloo drawing together at a little table",
    },
  },
  ...Array.from({ length: 8 }, (_, index) => ({
    value: index + 2,
    tone: TONES[index + 1],
  })),
];

export function findPuzzleStage(value: number): PuzzleStage | undefined {
  return puzzleStages.find((stage) => stage.value === value);
}
