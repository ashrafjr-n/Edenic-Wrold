/** A point on a tracing guide, in a 0–100 square. Resolution-independent on
    purpose: the guide is drawn into an SVG viewBox and the child's finger is
    mapped into the same space, so scoring means the same thing on a phone and
    on a desktop. */
export type StrokePoint = readonly [number, number];

/** One continuous pen-down stroke of a numeral, as its CENTRELINE — the line a
    child is taught to write along, not the outline of the clay render. A
    numeral like 4 needs two of them. */
export type NumberStroke = readonly StrokePoint[];

export interface NumberItem {
  /** 1–9. Also the route segment: `/learn/pinki/numbers/1`. */
  value: number;
  image: string;
  /** The render's own pixel size. Needed because the nine numerals did NOT
      all come off one canvas — 1–3 are 412x606 and 4–9 are 426x585 — and
      `NumberComplete` has to size its board to the numeral's OWN ratio, or
      `object-contain` letterboxes it and the hole and the loose piece end up
      measured in slightly different spaces. Invisible on the small notch that
      activity used to cut; obvious now that the piece is half the numeral. */
  imageSize: { width: number; height: number };
  /** Local clip for this number's short, served straight from `/public`. */
  video: string;
  strokes: readonly NumberStroke[];
}
