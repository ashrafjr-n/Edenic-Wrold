import puzzle1 from "../../public/assets/activity-page/puzzle/1/puzzle-1.jpg";
import puzzle2 from "../../public/assets/activity-page/puzzle/2/puzzle-2.jpg";
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

/**
 * Nine stages. Only the first two have their pictures so far; the rest are
 * declared so the grid can show the shape of the whole set, the same way the
 * numbers lesson lists 1–9 with only the first fully built.
 *
 * **Each stage owns its own cut.** Stage 1 is 3 × 3, stage 2 is 4 × 3 — three
 * more pieces, which is how a stage gets harder. Nothing else about a stage
 * changes to make it harder; the board, the tray and the jigsaw outlines all
 * read the grid from here.
 */
export const puzzleStages: PuzzleStage[] = [
  {
    value: 1,
    tone: TONES[0],
    grid: { cols: 3, rows: 3 },
    picture: {
      image: puzzle1,
      alt: "Pinki, Nova and Bloo drawing together at a little table",
    },
  },
  {
    value: 2,
    tone: TONES[1],
    grid: { cols: 4, rows: 3 },
    picture: {
      image: puzzle2,
      alt: "Pinki, Bloo and Nova playing with a ball in the park",
    },
  },
  ...Array.from({ length: 7 }, (_, index) => ({
    value: index + 3,
    tone: TONES[index + 2],
  })),
];

export function findPuzzleStage(value: number): PuzzleStage | undefined {
  return puzzleStages.find((stage) => stage.value === value);
}
