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
