/** The rectangle cut out of a numeral's own render, in the SAME 0–100 percent
    space as the numeral PNG itself (edge to edge — `NumberComplete` sizes its
    board to that numeral's own aspect, so there is no `object-contain`
    letterboxing between this data and the image). A plain rectangle rather
    than a shape traced around the glyph's silhouette: a jigsaw-style square
    reads clearly to a small child and needs no per-pixel masking. */
export interface CompleteNotch {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * **The BOTTOM HALF of the numeral, and the same rectangle for every one of
 * them.** Direct request: the piece used to be a small hand-tuned chunk — the
 * right-hand end of 2's base bar, the foot of 4's stem, the curl of 9's tail —
 * each measured off that numeral's own alpha, and each was reported as far too
 * small to read as "part of the number is missing".
 *
 * A half is also why this stopped needing a per-number table at all. Measured
 * across all nine renders, every glyph's alpha box starts within 1.5% of the
 * top of its canvas and ends within 3% of the bottom, so its own vertical
 * midpoint lands on 49.6–50.0 in every case — one `y: 50` is the honest cut
 * for all of them, not an approximation that happens to work. Full width for
 * the same reason: the widest glyph reaches 99% of its canvas, so a rect inset
 * to any particular numeral would clip that one and float free of the rest.
 *
 * If a single numeral ever needs its own cut again, this goes back to a
 * `Record<number, CompleteNotch>` keyed by value — but do not add one
 * speculatively, the whole point of the change was that nine identical halves
 * are more legible than nine clever chunks.
 */
export const COMPLETE_NOTCH: CompleteNotch = { x: 0, y: 50, w: 100, h: 50 };
