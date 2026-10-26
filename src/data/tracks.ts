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

/** Each walking animal's footprints. */
export const TRACKS = { cat } satisfies Record<string, Tracks>;

export type Walker = keyof typeof TRACKS;
