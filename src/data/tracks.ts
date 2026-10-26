import type { PrintPart, Tracks } from "@/types/course";

/* Every animal's footprints, drawn as a field guide draws them (Match the
   footprints, Bloo's Animals — 2026-10-26): each foot a right one, toes
   up, round 0,0 in a −50…50 box; each trail on a 100×130 sheet, walking
   up the sheet, bottom print first. Sizes are true to each other — an
   elephant's sole fills a sheet, a mouse's foot is a few toes. The fish
   has none: it has no feet. */

/** Thin toes from one point, each ending in a dot (`dot` its radius). */
const toes = (from: readonly [number, number], tips: readonly (readonly [number, number])[], w: number, dot: number): PrintPart[] =>
  tips.flatMap(([x, y]) => [{ d: `M ${from[0]} ${from[1]} L ${x} ${y}`, w }, { e: [x, y, dot, dot] }]);

/* Cat: round, four teardrop toes and NO claws (drawn in as it walks),
   the leading toe a little ahead; the heel pad wide, two lobes in front,
   three behind. Walks one paw before the other, nearly in a line. */
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

/* Elephant: one big round sole pressed soft and cracked, toenails along
   its front edge. Two steps fill the sheet. */
const elephant: Tracks = {
  feet: {
    front: [
      { e: [0, 0, 44, 48], o: 0.22 },
      { e: [0, 0, 44, 48], w: 3.2, o: 0.85 },
      { d: "M -30 6 Q -16 -2 -2 8 T 28 4", w: 1.8, o: 0.45 },
      { d: "M -22 24 Q -8 17 6 27 T 26 22", w: 1.8, o: 0.45 },
      { d: "M -12 -16 Q 0 -9 14 -16", w: 1.8, o: 0.45 },
      { d: "M -2 8 L 2 22", w: 1.6, o: 0.4 },
      { d: "M 10 -16 L 8 4", w: 1.6, o: 0.4 },
      { e: [-31, -28, 7.5, 5, -52] },
      { e: [-12, -41, 7.5, 5, -18] },
      { e: [12, -41, 7.5, 5, 18] },
      { e: [31, -28, 7.5, 5, 52] },
    ],
  },
  steps: [
    { at: [36, 96], s: 0.46, left: true },
    { at: [64, 36], s: 0.46 },
  ],
};

/* Mouse: tiny, and it bounds — prints in fours: the long hind feet (five
   toes) land ahead of and wider than the little front ones (four toes,
   a star). A thin tail line runs through. */
const mouse: Tracks = {
  feet: {
    front: [{ e: [0, 6, 10, 9] }, ...toes([0, 2], [[-30, -14], [-12, -34], [12, -34], [30, -14]], 7, 6)],
    hind: [{ d: "M -9 4 C -9 -6 9 -6 9 4 L 6 36 C 5 42 -5 42 -6 36 Z" }, ...toes([0, -2], [[-34, 4], [-20, -30], [0, -38], [20, -30], [34, 4]], 6, 5.5)],
  },
  steps: [
    { at: [45, 114], s: 0.13, left: true },
    { at: [55, 110], s: 0.13 },
    { at: [37, 94], s: 0.15, left: true, hind: true },
    { at: [63, 94], s: 0.15, hind: true },
    { at: [45, 64], s: 0.13, left: true },
    { at: [55, 60], s: 0.13 },
    { at: [37, 44], s: 0.15, left: true, hind: true },
    { at: [63, 44], s: 0.15, hind: true },
    { at: [45, 14], s: 0.13, left: true },
    { at: [55, 10], s: 0.13 },
  ],
  drag: { d: "M 50 128 C 46 112 54 98 50 84 S 46 56 50 40 S 54 14 50 2", w: 1.2 },
};

/* Bird (a sparrow): three thin toes forward, one back; it HOPS, so the
   prints come in pairs, side by side. */
const birdFoot: PrintPart[] = [
  { d: "M 0 4 Q -1 -18 1 -44", w: 6 },
  { d: "M 0 4 Q -12 -14 -24 -32", w: 6 },
  { d: "M 0 4 Q 12 -14 24 -32", w: 6 },
  { d: "M 0 4 Q 1 16 -1 28", w: 6 },
  { e: [0, 2, 5.5, 6] },
];
const bird: Tracks = {
  feet: { front: birdFoot },
  steps: [
    { at: [41, 106], s: 0.27, r: 8, left: true },
    { at: [59, 106], s: 0.27, r: -8 },
    { at: [41, 64], s: 0.27, r: 8, left: true },
    { at: [59, 64], s: 0.27, r: -8 },
    { at: [41, 22], s: 0.27, r: 8, left: true },
    { at: [59, 22], s: 0.27, r: -8 },
  ],
};

/* Parrot: two toes forward, two BACK — an X — and it walks, toes in. */
const parrot: Tracks = {
  feet: {
    front: [
      { d: "M 0 0 Q -6 -20 -16 -38", w: 8.5 },
      { d: "M 0 0 Q 6 -20 14 -36", w: 8.5 },
      { d: "M 0 0 Q -8 16 -20 30", w: 8.5 },
      { d: "M 0 0 Q 8 16 18 28", w: 8.5 },
      { e: [0, 0, 7, 8] },
    ],
  },
  steps: [
    { at: [42, 108], s: 0.25, r: 14, left: true },
    { at: [58, 78], s: 0.29, r: -14 },
    { at: [42, 48], s: 0.25, r: 14, left: true },
    { at: [58, 18], s: 0.29, r: -14 },
  ],
};

/* Turtle: a short pad with long claw scratches; the feet wide apart either
   side of the shell, which drags a line down the middle. */
const turtle: Tracks = {
  feet: {
    front: [
      { e: [0, 10, 16, 11], o: 0.85 },
      { d: "M -12 0 L -19 -22", w: 4.5 },
      { d: "M -6 -3 L -9 -28", w: 4.5 },
      { d: "M 0 -4 L 0 -30", w: 4.5 },
      { d: "M 6 -3 L 9 -28", w: 4.5 },
      { d: "M 12 0 L 19 -22", w: 4.5 },
    ],
  },
  steps: [
    { at: [24, 112], s: 0.3, r: -22, left: true },
    { at: [76, 94], s: 0.3, r: 22 },
    { at: [24, 72], s: 0.3, r: -22, left: true },
    { at: [76, 54], s: 0.3, r: 22 },
    { at: [24, 32], s: 0.3, r: -22, left: true },
    { at: [76, 14], s: 0.3, r: 22 },
  ],
  drag: { d: "M 50 128 L 50 2", w: 2.5 },
};

/* Gecko: five thin splayed toes, each ending in a round sticky pad; wide
   steps, and the tail swings an S behind. */
const gecko: Tracks = {
  feet: {
    front: [{ e: [0, 8, 9, 9] }, ...toes([0, 6], [[-36, -4], [-24, -30], [-2, -40], [20, -32], [34, -10]], 4.5, 6)],
  },
  steps: [
    { at: [27, 108], s: 0.31, r: -24, left: true },
    { at: [73, 86], s: 0.31, r: 24 },
    { at: [27, 56], s: 0.31, r: -24, left: true },
    { at: [73, 34], s: 0.31, r: 24 },
  ],
  drag: { d: "M 50 128 C 64 112 36 96 50 80 S 64 48 50 32 S 40 10 50 2", w: 1.6 },
};

/** Each walking animal's footprints. */
export const TRACKS = { cat, dog, elephant, mouse, bird, parrot, turtle, gecko } satisfies Record<string, Tracks>;

export type Walker = keyof typeof TRACKS;
