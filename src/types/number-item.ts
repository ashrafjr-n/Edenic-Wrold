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
  /** YouTube id for this number's short. Optional — the videos are being
      produced progressively, and an item without one simply starts the child
      at the tracing step instead of showing an empty frame. */
  videoId?: string;
  strokes: readonly NumberStroke[];
}
