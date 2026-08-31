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
  /* The rounded foot at the bottom of 4's vertical stroke. */
  4: { x: 56, y: 78, w: 28, h: 20 },
  /* The curled tail at the bottom-left of 9. */
  9: { x: 10, y: 74, w: 30, h: 24 },
};

/** A safety-net rect for a number that reaches `complete` without a tuned
    entry — should not normally happen, since only numbers with an entry
    above are ever configured for this activity. */
const FALLBACK_NOTCH: CompleteNotch = { x: 55, y: 75, w: 28, h: 22 };

export function completeNotchFor(value: number): CompleteNotch {
  return notchByValue[value] ?? FALLBACK_NOTCH;
}
