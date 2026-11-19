import puzzle1 from "../../public/assets/play/puzzle/1/puzzle-1.jpg";
import puzzle2 from "../../public/assets/play/puzzle/2/puzzle-2.jpg";
import puzzle3 from "../../public/assets/play/puzzle/3/puzzle-3.jpg";
import puzzle4 from "../../public/assets/play/puzzle/4/puzzle-4.jpg";
import puzzle5 from "../../public/assets/play/puzzle/5/puzzle-5.jpg";
import puzzle6 from "../../public/assets/play/puzzle/6/puzzle-6.jpg";
import puzzle7 from "../../public/assets/play/puzzle/7/puzzle-7.jpg";
import puzzle8 from "../../public/assets/play/puzzle/8/puzzle-8.jpg";
import puzzle9 from "../../public/assets/play/puzzle/9/puzzle-9.jpg";
import puzzle10 from "../../public/assets/play/puzzle/10/puzzle-10.jpg";
import puzzle11 from "../../public/assets/play/puzzle/11/puzzle-11.jpg";
import puzzle12 from "../../public/assets/play/puzzle/12/puzzle-12.jpg";
import puzzle13 from "../../public/assets/play/puzzle/13/puzzle-13.jpg";
import puzzle14 from "../../public/assets/play/puzzle/14/puzzle-14.jpg";
import puzzle15 from "../../public/assets/play/puzzle/15/puzzle-15.jpg";
import type { PuzzleStage, PuzzleTone } from "@/types/puzzle";

/** A colour each, so a wall of unopened puzzles reads as that many different
    things to look forward to rather than one grid of grey. Every pair is an
    existing site token — no new hues — laid out so no two neighbours in the
    three-wide grid share a family. Fifteen stages is five rows of three, and
    the palette runs out well before fifteen distinct hues do, so the last two
    rows repeat colours from the first three — never one directly above. */
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
  { face: "var(--accent)", edge: "var(--accent-dark)" },
  { face: "var(--color-nova)", edge: "var(--color-nova-dark)" },
  {
    face: "var(--color-subject-shapes)",
    edge: "var(--color-subject-shapes-dark)",
  },
];

/**
 * Fifteen stages, every one of them with its picture. Fifteen is the whole
 * set — no more are planned.
 *
 * **Each stage owns its own cut, and that is the only thing that makes a
 * stage harder.** The board, the heap, the crop maths and the jigsaw
 * outlines all read `grid` from here, so a stage can be any shape.
 *
 * The counts climb in five steps: 9 and then 12 to learn the game, 16–20 once
 * the child has the idea, 25–30 after that, 36–49 for a child who has finished
 * the first nine, and 56–72 for the three at the very end.
 *
 * The grids are not chosen for their piece count alone — each one is picked
 * so its CELLS COME OUT NEARLY SQUARE against its own picture. Stages 1–3 are
 * landscape (1376 × 774) and 4–15 are square (1024 × 1024), so a cut that
 * suits one is wrong for the other: 4 × 3 on a square picture would give
 * pieces a third wider than they are tall. Change a picture's shape and its
 * grid has to be re-picked with it.
 *
 * **Every picture is a frame of its stage's song** (2026-11-19): the finished
 * puzzle offers that song (`song`, 720p in `public/assets/watch/songs/`). The
 * frames were picked by hand from the songs, the sharpest moment with no
 * transition on it, a 1080 square cut from the 1920 frame for 4–15.
 */
export const puzzleStages: PuzzleStage[] = [
  {
    value: 1,
    tone: TONES[0],
    grid: { cols: 3, rows: 3 },
    picture: {
      image: puzzle1,
      alt: "Pinki and Bloo on their armchairs, Nova sitting with them",
      song: "/assets/watch/songs/song-002.mp4",
    },
  },
  {
    value: 2,
    tone: TONES[1],
    grid: { cols: 4, rows: 3 },
    picture: {
      image: puzzle2,
      alt: "Nova with a giraffe, an elephant, a hippo and a lion by the pond",
      song: "/assets/watch/songs/song-004.mp4",
    },
  },
  {
    value: 3,
    tone: TONES[2],
    grid: { cols: 4, rows: 3 },
    picture: {
      image: puzzle3,
      alt: "Bloo, Nova and Pinki playing with blocks in their room",
      song: "/assets/watch/songs/song-011.mp4",
    },
  },
  /* 4–15 are SQUARE — a tall board leaves a phone no room for the heap of
     loose pieces underneath it; a square one does. */
  {
    value: 4,
    tone: TONES[3],
    grid: { cols: 4, rows: 4 },
    picture: {
      image: puzzle4,
      alt: "Nova building a tower of soft blocks",
      song: "/assets/watch/songs/song-001.mp4",
    },
  },
  {
    value: 5,
    tone: TONES[4],
    grid: { cols: 4, rows: 4 },
    picture: {
      image: puzzle5,
      alt: "Bloo in front of a wall of soft blocks",
      song: "/assets/watch/songs/song-005.mp4",
    },
  },
  {
    value: 6,
    tone: TONES[5],
    grid: { cols: 5, rows: 4 },
    picture: {
      image: puzzle6,
      alt: "Pinki in a field of big flowers in the sunshine",
      song: "/assets/watch/songs/song-006.mp4",
    },
  },
  {
    value: 7,
    tone: TONES[6],
    grid: { cols: 5, rows: 5 },
    picture: {
      image: puzzle7,
      alt: "Nova and Pinki sweeping the street",
      song: "/assets/watch/songs/song-007.mp4",
    },
  },
  {
    value: 8,
    tone: TONES[7],
    grid: { cols: 5, rows: 5 },
    picture: {
      image: puzzle8,
      alt: "Bloo riding a cloud with the birds",
      song: "/assets/watch/songs/song-008.mp4",
    },
  },
  {
    value: 9,
    tone: TONES[8],
    grid: { cols: 6, rows: 5 },
    picture: {
      image: puzzle9,
      alt: "Nova and the turtle at the lemonade stand",
      song: "/assets/watch/songs/song-009.mp4",
    },
  },
  {
    value: 10,
    tone: TONES[9],
    grid: { cols: 6, rows: 6 },
    picture: {
      image: puzzle10,
      alt: "Bloo sweeping the room with a rainbow broom",
      song: "/assets/watch/songs/song-003.mp4",
    },
  },
  {
    value: 11,
    tone: TONES[10],
    grid: { cols: 7, rows: 6 },
    picture: {
      image: puzzle11,
      alt: "Pinki in her rocking chair outside her house",
      song: "/assets/watch/songs/song-012.mp4",
    },
  },
  {
    value: 12,
    tone: TONES[11],
    grid: { cols: 7, rows: 7 },
    picture: {
      image: puzzle12,
      alt: "Bloo, the turtle and Nova under a rainbow arch of blocks",
      song: "/assets/watch/songs/song-013.mp4",
    },
  },
  {
    value: 13,
    tone: TONES[12],
    grid: { cols: 8, rows: 7 },
    picture: {
      image: puzzle13,
      alt: "Bloo with a glass of milk",
      song: "/assets/watch/songs/song-014.mp4",
    },
  },
  {
    value: 14,
    tone: TONES[13],
    grid: { cols: 8, rows: 8 },
    picture: {
      image: puzzle14,
      alt: "Pinki and Bloo cleaning up their room",
      song: "/assets/watch/songs/clean-up.mp4",
    },
  },
  {
    value: 15,
    tone: TONES[14],
    grid: { cols: 9, rows: 8 },
    picture: {
      image: puzzle15,
      alt: "Bloo jumping on the path among the shape lollipops",
      song: "/assets/watch/songs/song-010.mp4",
    },
  },
];

export function findPuzzleStage(value: number): PuzzleStage | undefined {
  return puzzleStages.find((stage) => stage.value === value);
}
