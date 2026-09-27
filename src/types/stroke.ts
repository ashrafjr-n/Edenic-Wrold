/** A point on a tracing guide, in a 0–100 square. Resolution-independent on
    purpose: the guide is drawn into an SVG viewBox and the child's finger is
    mapped into the same space, so scoring means the same thing on a phone and
    on a desktop. */
export type StrokePoint = readonly [number, number];

/** One continuous pen-down stroke of a shape, as its CENTRELINE — the line a
    child is taught to draw along, not the outline of a clay render. A shape
    drawn in two movements needs two of them. */
export type Stroke = readonly StrokePoint[];
