import type { PuzzlePiece } from "@/lib/puzzle-pieces";
import type { PuzzleGrid } from "@/types/puzzle";

/**
 * Real jigsaw outlines, as SVG clip paths.
 *
 * Each knob is ONE elliptical arc drawn the long way round (`large-arc = 1`)
 * between two points closer together than the circle's own diameter — which
 * is what gives a jigsaw tab its narrow neck. No bezier guesswork, and the
 * neighbouring piece reads the same edge table, so a tab and the socket it
 * drops into are the same curve by construction.
 *
 * The paths are in `objectBoundingBox` units (0–1), so one definition scales
 * to whatever size the board is rendered at. The knob is sized from the SHORT
 * side of a cell — whichever that is, since an upright picture's cells can be
 * taller than they are wide — and its two radii are normalised separately
 * (`rx` against the box width, `ry` against its height), so it comes out
 * round on screen whatever shape the cell is.
 */

/** Knob chord half-length and radius, as shares of a cell's short side. The
    radius must stay the larger of the two or the arc has no neck. */
const KNOB_CHORD = 0.15;
const KNOB_RADIUS = 0.19;

/** How far a knob bulges past the cell edge, as a share of a cell's SHORT
    side: the far point of a circle drawn the long way round its chord. Every
    piece box is grown by this much on all four sides to make room — see
    `--tab` in `PuzzleBoard`, which multiplies it by the shorter of the two
    cell dimensions. */
export const TAB_DEPTH =
  KNOB_RADIUS + Math.sqrt(KNOB_RADIUS ** 2 - KNOB_CHORD ** 2);

/** Which way each internal edge bulges. Any deterministic rule works as long
    as both pieces sharing an edge read the same one — alternating gives the
    natural chequerboard a real jigsaw has. `true` means the piece BELOW (or
    to the RIGHT) carries the outward tab. */
const tabsDown = (row: number, col: number) => (row + col) % 2 === 0;
const tabsRight = (row: number, col: number) => (row + col) % 2 === 1;

/** `1` = the tab points out of the piece, `-1` = it bites into it, `0` = this
    is the picture's own border and stays a straight line. */
type EdgeDir = -1 | 0 | 1;

interface Edges {
  top: EdgeDir;
  right: EdgeDir;
  bottom: EdgeDir;
  left: EdgeDir;
}

function edgesFor(piece: PuzzlePiece, grid: PuzzleGrid): Edges {
  const { row, col } = piece;

  return {
    top: row === 0 ? 0 : tabsDown(row, col) ? 1 : -1,
    /* The edge below this piece is described from the lower piece's side, so
       this piece takes the opposite of it. */
    bottom: row === grid.rows - 1 ? 0 : tabsDown(row + 1, col) ? -1 : 1,
    left: col === 0 ? 0 : tabsRight(row, col) ? 1 : -1,
    right: col === grid.cols - 1 ? 0 : tabsRight(row, col + 1) ? -1 : 1,
  };
}

interface Metrics {
  /** The core cell's edges, in bounding-box units. */
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  rx: number;
  ry: number;
  /** Half the knob's chord, along each axis. */
  cx: number;
  cy: number;
}

/** Everything the paths need, normalised against the grown piece box. `ratio`
    is a cell's width divided by its height. */
function metrics(ratio: number): Metrics {
  /* Work in units of a cell's height, and size the knob off whichever side is
     SHORTER — an upright picture cut into near-square cells can put either
     one there, and a knob measured off the long side would swallow the short
     one. `short` is 1 whenever the cells are wider than they are tall, which
     is why the landscape stages come out byte-identical to before. */
  const cellH = 1;
  const cellW = ratio;
  const short = Math.min(cellW, cellH);

  const tab = TAB_DEPTH * short;
  const radius = KNOB_RADIUS * short;
  const chord = KNOB_CHORD * short;
  const boxW = cellW + 2 * tab;
  const boxH = cellH + 2 * tab;

  return {
    x0: tab / boxW,
    y0: tab / boxH,
    x1: 1 - tab / boxW,
    y1: 1 - tab / boxH,
    rx: radius / boxW,
    ry: radius / boxH,
    cx: chord / boxW,
    cy: chord / boxH,
  };
}

/* The boundary is walked clockwise, so an outward bulge is always the
   clockwise arc (`sweep = 1`) and an inward one the other way. */
function sweepFor(dir: EdgeDir): 0 | 1 {
  return dir === 1 ? 1 : 0;
}

function horizontalEdge(
  y: number,
  fromX: number,
  toX: number,
  dir: EdgeDir,
  m: Metrics,
): string {
  if (dir === 0) return `L ${toX} ${y}`;

  const mid = (fromX + toX) / 2;
  const step = Math.sign(toX - fromX) * m.cx;

  return [
    `L ${mid - step} ${y}`,
    `A ${m.rx} ${m.ry} 0 1 ${sweepFor(dir)} ${mid + step} ${y}`,
    `L ${toX} ${y}`,
  ].join(" ");
}

function verticalEdge(
  x: number,
  fromY: number,
  toY: number,
  dir: EdgeDir,
  m: Metrics,
): string {
  if (dir === 0) return `L ${x} ${toY}`;

  const mid = (fromY + toY) / 2;
  const step = Math.sign(toY - fromY) * m.cy;

  return [
    `L ${x} ${mid - step}`,
    `A ${m.rx} ${m.ry} 0 1 ${sweepFor(dir)} ${x} ${mid + step}`,
    `L ${x} ${toY}`,
  ].join(" ");
}

/** One piece's outline, walked clockwise from its top-left corner. */
export function piecePath(
  piece: PuzzlePiece,
  ratio: number,
  grid: PuzzleGrid,
): string {
  const m = metrics(ratio);
  const edges = edgesFor(piece, grid);

  return [
    `M ${m.x0} ${m.y0}`,
    horizontalEdge(m.y0, m.x0, m.x1, edges.top, m),
    verticalEdge(m.x1, m.y0, m.y1, edges.right, m),
    horizontalEdge(m.y1, m.x1, m.x0, edges.bottom, m),
    verticalEdge(m.x0, m.y1, m.y0, edges.left, m),
    "Z",
  ].join(" ");
}

/** The DOM id of a piece's clip path. One board is on screen at a time, so a
    plain per-piece id is stable and unique. */
export function clipId(pieceId: number): string {
  return `puzzle-clip-${pieceId}`;
}
