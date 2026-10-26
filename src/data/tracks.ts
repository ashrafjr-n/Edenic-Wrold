import type { Tracks } from "@/types/course";

/* Every animal's footprints, drawn as a field guide draws them (Match the
   footprints, Bloo's Animals — 2026-10-26): each foot a right one, toes
   up, round 0,0 in a −50…50 box; each trail on a 100×130 sheet, walking
   up the sheet, bottom print first. Sizes are true to each other — an
   elephant's sole fills a sheet, a mouse's foot is a few toes. The fish
   has none: it has no feet. */

/* Cat: round, four teardrop toes and NO claws (drawn in as it walks), the
   leading toe a little ahead; the heel pad wide, two lobes in front, three
   behind. Walks one paw before the other, nearly in a line. */
const cat: Tracks = {
  feet: {
    front: [
      { d: "M -23 9 C -19 -1 -8 -2 -1 1.5 C 0 2 1 2 2 1.5 C 9 -2 20 -1 24 9 C 28 19 26 31 18 34 C 14 35 11 33 7.5 34 C 4 35.5 -3 35.5 -6.5 34 C -10 33 -12 35 -16 34 C -25 31 -27 19 -23 9 Z" },
      { e: [-26, -13, 7.5, 9.5, -28] },
      { e: [-10, -27, 8, 10.5, -10] },
      { e: [9, -31, 8, 10.5, 8] },
      { e: [26, -17, 7.5, 9.5, 28] },
    ],
  },
  steps: [
    { at: [44, 112], s: 0.31, left: true },
    { at: [56, 82], s: 0.31 },
    { at: [44, 52], s: 0.31, left: true },
    { at: [56, 22], s: 0.31 },
  ],
};

/* Dog: longer than wide, four oval toes with a CLAW mark ahead of each,
   the middle two forward and close; the heel pad one lobe in front, two
   behind — an X fits in the space between. */
const dog: Tracks = {
  feet: {
    front: [
      { d: "M 0 3 C 11 3 23 15 22 26 C 21 33 14 35 9 32 C 5 30 -5 30 -9 32 C -14 35 -21 33 -22 26 C -23 15 -11 3 0 3 Z" },
      { e: [-22, -6, 7, 10, -24] },
      { e: [22, -6, 7, 10, 24] },
      { e: [-8, -25, 7.5, 11, -5] },
      { e: [8, -25, 7.5, 11, 5] },
      { d: "M -27 -17 L -30 -24", w: 4.5 },
      { d: "M 27 -17 L 30 -24", w: 4.5 },
      { d: "M -9 -40 L -10 -47", w: 4.5 },
      { d: "M 9 -40 L 10 -47", w: 4.5 },
    ],
  },
  steps: [
    { at: [42, 110], s: 0.29, left: true },
    { at: [58, 80], s: 0.29 },
    { at: [42, 50], s: 0.29, left: true },
    { at: [58, 20], s: 0.29 },
  ],
};

/** Each walking animal's footprints. */
export const TRACKS = { cat, dog } satisfies Record<string, Tracks>;

export type Walker = keyof typeof TRACKS;
