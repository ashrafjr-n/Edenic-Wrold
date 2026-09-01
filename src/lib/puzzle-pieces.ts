import type { CSSProperties } from "react";
import type { PuzzleGrid } from "@/types/puzzle";

export interface PuzzlePiece {
  /** `row * cols + col` — the piece's own place in the finished picture, and
      the only slot it will drop into. */
  id: number;
  row: number;
  col: number;
}

/** Every piece of a stage, in picture order. */
export function piecesFor(grid: PuzzleGrid): PuzzlePiece[] {
  return Array.from({ length: grid.cols * grid.rows }, (_, id) => ({
    id,
    row: Math.floor(id / grid.cols),
    col: id % grid.cols,
  }));
}

/**
 * A deterministic 0–1 from an integer.
 *
 * `Math.imul` keeps every step in exact 32-bit integer arithmetic, so this
 * gives the same answer in every engine. That matters more than it looks:
 * the tray renders on the server too, and anything that scattered the pieces
 * differently there would hydrate mismatched. `Math.random()` is out for the
 * same reason `Celebration` hard-codes its confetti.
 */
function hash(seed: number): number {
  let h = Math.imul(seed ^ 0x9e3779b9, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

export interface TraySpot {
  piece: PuzzlePiece;
  /** Where the piece lies in the tray, as a percentage of it. */
  x: number;
  y: number;
  /** Degrees. The pieces are tipped, not lined up — they read as tipped out
      of a box rather than laid out for you. */
  rotate: number;
}

/** The share of the tray kept clear at each edge, so a jittered piece still
    has room to lie inside it however many columns there are. */
const SLOT_INSET = 0.12;
/** How far a piece may wander from its loose slot, and how far it may tip. */
const SCATTER_X = 6;
const SCATTER_Y = 8;
const MAX_TILT = 22;

/** Spreads `count` slots across the tray, squeezed in from both edges. */
function slotAt(index: number, count: number): number {
  return (
    (SLOT_INSET + ((index + 0.5) / count) * (1 - 2 * SLOT_INSET)) * 100
  );
}

/** How many rows deep the heap lies, as a share of the picture's own. */
const HEAP_ROW_SHARE = 0.6;

/**
 * The shape of the loose heap — how many slots across and down the tray gets.
 *
 * A LANDSCAPE picture's own grid is already the shape the tray is, so the heap
 * keeps it and those stages are untouched.
 *
 * An UPRIGHT one's is not. The tray under a square board has to be SHALLOW or
 * the two together do not fit a phone screen, so the heap is dealt into about
 * 60% as many rows as the picture has and as many columns as that takes —
 * wide and shallow, whatever the cut. It is the tray's height that this is
 * really choosing: the tray is `rows + 0.9` cells tall, so every row the heap
 * loses is a cell of screen the board gets to keep.
 *
 * The slot count can come out slightly above the piece count (25 pieces lie on
 * 9 × 3); the walk in `trayLayout` only ever deals the first `total` of them,
 * which just leaves the last row of the heap a little short.
 */
export function traySlots(grid: PuzzleGrid, upright: boolean): PuzzleGrid {
  if (!upright) return grid;

  const rows = Math.max(2, Math.round(grid.rows * HEAP_ROW_SHARE));
  return { cols: Math.ceil((grid.cols * grid.rows) / rows), rows };
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/**
 * The stride the slot walk takes.
 *
 * It has to be coprime with the piece count or the walk repeats and several
 * pieces are dealt the same slot — 5 and 15 share a factor of 3, which would
 * have piled a 3 × 5 stage's fifteen pieces onto five slots. 5 is coprime
 * with 9, 12, 16, 20, 25 and 30, so nothing built so far has needed another
 * one — but a cut that does would silently deal several pieces the same slot
 * without this.
 */
function stepFor(total: number): number {
  let step = 5;
  while (gcd(step, total) !== 1) step += 1;
  return step;
}

/**
 * Where each loose piece lies in the tray.
 *
 * The pieces are dropped onto a loose grid of `slots` and then jittered and
 * tipped, so they overlap and lie at angles like a box tipped out — but never
 * so far that one ends up completely buried under another and unreachable.
 * Deterministic, seeded from the stage and the piece (see `hash`).
 */
export function trayLayout(
  stage: number,
  grid: PuzzleGrid,
  slots: PuzzleGrid,
): TraySpot[] {
  const pieces = piecesFor(grid);
  const total = pieces.length;
  const step = stepFor(total);

  return pieces.map((piece) => {
    const seed = stage * 1000 + piece.id;
    /* A loose slot each, walked with a stride coprime to the piece count so
       every piece lands somewhere different from where it belongs in the
       picture. */
    const slot = (stage + piece.id * step) % total;

    return {
      piece,
      x:
        slotAt(slot % slots.cols, slots.cols) +
        (hash(seed) - 0.5) * 2 * SCATTER_X,
      y:
        slotAt(Math.floor(slot / slots.cols), slots.rows) +
        (hash(seed + 77) - 0.5) * 2 * SCATTER_Y,
      rotate: (hash(seed + 131) - 0.5) * 2 * MAX_TILT,
    };
  });
}

/** A piece's box: its cell grown by the tab depth on all four sides, so a knob
    has somewhere to stick out. Grown symmetrically, which is what keeps the
    box's centre exactly on the cell's centre — the drop test depends on it. */
export const pieceBoxStyle: CSSProperties = {
  width: "calc(var(--cell-w) + 2 * var(--tab))",
  height: "calc(var(--cell-h) + 2 * var(--tab))",
};

/**
 * The oversized inner image that makes a piece box show only that piece's
 * slice of the picture — the classic sprite crop, one file and N crops.
 *
 * The image is drawn at the size of the whole board and pushed left and up by
 * whole cells until the wanted one lands in the box, offset by the tab depth
 * so the crop lines up with the piece's CORE rather than its grown box.
 */
export function pieceCropStyle(
  piece: PuzzlePiece,
  grid: PuzzleGrid,
): CSSProperties {
  return {
    position: "absolute",
    width: `calc(var(--cell-w) * ${grid.cols})`,
    height: `calc(var(--cell-h) * ${grid.rows})`,
    left: `calc(var(--tab) - ${piece.col} * var(--cell-w))`,
    top: `calc(var(--tab) - ${piece.row} * var(--cell-h))`,
    maxWidth: "none",
  };
}

/** Where a piece's box sits on the board — pulled back by the tab depth so
    that the piece's core lands exactly on its own cell. The cells themselves
    are gapless, so a drop can be judged with plain arithmetic off the board's
    own rect instead of a ref per slot. */
export function slotStyle(piece: PuzzlePiece): CSSProperties {
  return {
    left: `calc(${piece.col} * var(--cell-w) - var(--tab))`,
    top: `calc(${piece.row} * var(--cell-h) - var(--tab))`,
  };
}
