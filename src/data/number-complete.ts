/** A rectangular notch cut from a numeral's own render, in the SAME 0–100
    percent space as the numeral PNG itself (edge to edge — there is no
    `object-contain` letterboxing between this data and the image, so these
    numbers are tuned against the actual pixels, not a guess). A plain
    rectangle rather than a shape traced around the glyph's silhouette: a
    jigsaw-style square reads clearly to a small child and needs no
    per-pixel masking. */
export interface CompleteNotch {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Only numbers using the `complete` activity need an entry — picked by eye
    against the actual render, one clearly separable chunk per numeral. */
const notchByValue: Record<number, CompleteNotch> = {
  /* The right-hand end of 2's flat base bar, cut back to where the diagonal
     lands on it. Measured off `numbers/2.png`'s own alpha rather than picked
     by eye: this rect is 95% solid pixels, and the bar's right edge runs to
     x 96 at its widest (y 85–90). 2 uses this at the `game` stage, not at
     `count` — see `data/game-activities.ts`. */
  2: { x: 70, y: 75, w: 26, h: 22 },
  /* The rounded foot at the bottom of 4's vertical stroke, with a little
     clearance all round — a rect that clips the stem leaves a sliver of it
     still showing beside the gap, and the piece then never looks like it
     belongs there. */
  4: { x: 49, y: 76, w: 36, h: 23 },
  /* The curled tip of 9's tail, up to where it runs back into the bowl. */
  9: { x: 4, y: 65, w: 36, h: 28 },
};

/** A safety-net rect for a number that reaches `complete` without a tuned
    entry — should not normally happen, since only numbers with an entry
    above are ever configured for this activity. */
const FALLBACK_NOTCH: CompleteNotch = { x: 55, y: 75, w: 28, h: 22 };

export function completeNotchFor(value: number): CompleteNotch {
  return notchByValue[value] ?? FALLBACK_NOTCH;
}
