import puzzle1 from "../../public/assets/activity-page/puzzle/1/puzzle-1.jpg";
import puzzle2 from "../../public/assets/activity-page/puzzle/2/puzzle-2.jpg";
import puzzle3 from "../../public/assets/activity-page/puzzle/3/puzzle-3.jpg";
import puzzle4 from "../../public/assets/activity-page/puzzle/4/puzzle-4.jpg";
import puzzle5 from "../../public/assets/activity-page/puzzle/5/puzzle-5.jpg";
import puzzle6 from "../../public/assets/activity-page/puzzle/6/puzzle-6.jpg";
import puzzle7 from "../../public/assets/activity-page/puzzle/7/puzzle-7.jpg";
import puzzle8 from "../../public/assets/activity-page/puzzle/8/puzzle-8.jpg";
import puzzle9 from "../../public/assets/activity-page/puzzle/9/puzzle-9.jpg";
import puzzle10 from "../../public/assets/activity-page/puzzle/10/puzzle-10.jpg";
import puzzle11 from "../../public/assets/activity-page/puzzle/11/puzzle-11.jpg";
import puzzle12 from "../../public/assets/activity-page/puzzle/12/puzzle-12.jpg";
import type { PuzzleStage, PuzzleTone } from "@/types/puzzle";

/** A colour each, so a wall of unopened puzzles reads as that many different
    things to look forward to rather than one grid of grey. Every pair is an
    existing site token — no new hues — laid out so no two neighbours in the
    three-wide grid share a family. Twelve stages is four rows of three, and
    the palette runs out before twelve distinct hues do, so the last row
    repeats colours from the first two — never one directly above it. */
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
  { face: "var(--color-go)", edge: "var(--color-go-dark)" },
  { face: "var(--color-gold)", edge: "var(--color-gold-dark)" },
  {
    face: "var(--color-subject-colors)",
    edge: "var(--color-subject-colors-dark)",
  },
];

/**
 * Twelve stages, every one of them with its picture.
 *
 * **Each stage owns its own cut, and that is the only thing that makes a
 * stage harder.** The board, the heap, the crop maths and the jigsaw
 * outlines all read `grid` from here, so a stage can be any shape.
 *
 * The counts climb in four steps: 9 and then 12 to learn the game, 16–20 once
 * the child has the idea, 25–30 after that, and 36–49 for a child who has
 * finished the other nine.
 *
 * The grids are not chosen for their piece count alone — each one is picked
 * so its CELLS COME OUT NEARLY SQUARE against its own picture. Stages 1–3 are
 * landscape (1376 × 768) and 4–12 are square (4–9 were cropped to it, 10–12
 * arrived that way at 1024 × 1024), so a cut that suits one is wrong for the
 * other: 4 × 3 on a square picture would give pieces a third wider than they
 * are tall. Change a picture's shape and its grid has to be re-picked with it.
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
  {
    value: 3,
    tone: TONES[2],
    grid: { cols: 4, rows: 3 },
    picture: {
      image: puzzle3,
      alt: "Pinki, Nova and Bloo picking flowers on a green hill",
    },
  },
  /* 4–9 are SQUARE (768 × 768, or 848 × 848 for 5 and 8) — cropped from the
     tall originals rather than scaled, so nothing is squashed and every
     character is still in frame. A tall board leaves a phone no room for the
     heap of loose pieces underneath it; a square one does. */
  {
    value: 4,
    tone: TONES[3],
    grid: { cols: 4, rows: 4 },
    picture: {
      image: puzzle4,
      alt: "Pinki, Nova and Bloo splashing in a paddling pool with rubber rings",
    },
  },
  {
    value: 5,
    tone: TONES[4],
    grid: { cols: 4, rows: 4 },
    picture: {
      image: puzzle5,
      alt: "Pinki, Nova and Bloo climbing a climbing wall",
    },
  },
  {
    value: 6,
    tone: TONES[5],
    grid: { cols: 5, rows: 4 },
    picture: {
      image: puzzle6,
      alt: "Pinki, Nova and Bloo flying a spaceship past the planets",
    },
  },
  {
    value: 7,
    tone: TONES[6],
    grid: { cols: 5, rows: 5 },
    picture: {
      image: puzzle7,
      alt: "Pinki, Nova and Bloo riding a little train through the hills",
    },
  },
  {
    value: 8,
    tone: TONES[7],
    grid: { cols: 5, rows: 5 },
    picture: {
      image: puzzle8,
      alt: "Pinki, Nova and Bloo playing basketball together",
    },
  },
  {
    value: 9,
    tone: TONES[8],
    grid: { cols: 6, rows: 5 },
    picture: {
      image: puzzle9,
      alt: "Pinki, Nova and Bloo painting a big picture on an easel",
    },
  },
  {
    value: 10,
    tone: TONES[9],
    grid: { cols: 6, rows: 6 },
    picture: {
      image: puzzle10,
      alt: "Pinki, Nova and Bloo planting and watering flowers in a garden",
    },
  },
  {
    value: 11,
    tone: TONES[10],
    grid: { cols: 7, rows: 6 },
    picture: {
      image: puzzle11,
      alt: "Pinki, Nova and Bloo mixing colours in a little science lab",
    },
  },
  {
    value: 12,
    tone: TONES[11],
    grid: { cols: 7, rows: 7 },
    picture: {
      image: puzzle12,
      alt: "Pinki, Nova and Bloo having a picnic beside a tent",
    },
  },
];

export function findPuzzleStage(value: number): PuzzleStage | undefined {
  return puzzleStages.find((stage) => stage.value === value);
}
