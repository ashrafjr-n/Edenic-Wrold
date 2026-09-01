import type { CSSProperties } from "react";
import { PUZZLE_COLS, PUZZLE_PIECES, PUZZLE_ROWS } from "@/data/puzzles";

export interface PuzzlePiece {
  /** `row * COLS + col` — the piece's own place in the finished picture, and
      the only slot it will drop into. */
  id: number;
  row: number;
  col: number;
}

/** The nine pieces in picture order. Static, so it is built once at module
    load rather than on every render. */
export const puzzlePieces: PuzzlePiece[] = Array.from(
  { length: PUZZLE_PIECES },
  (_, id) => ({
    id,
    row: Math.floor(id / PUZZLE_COLS),
    col: id % PUZZLE_COLS,
  }),
);

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

/** How far a piece may wander from its loose slot, and how far it may tip.
    The slots themselves sit at 20/50/80 rather than an even third each, so a
    jittered piece still has room to lie inside the tray. */
const SLOT_ORIGIN = 20;
const SLOT_STEP = 30;
const SCATTER_X = 6;
const SCATTER_Y = 8;
const MAX_TILT = 22;

/**
 * Where each loose piece lies in the tray.
 *
 * The pieces are dropped onto a loose 3 × 3 arrangement and then jittered and
 * tipped, so they overlap and lie at angles like a box tipped out — but never
 * so far that one ends up completely buried under another and unreachable.
 * Deterministic, seeded from the stage and the piece (see `hash`).
 */
export function trayLayout(stage: number): TraySpot[] {
  return puzzlePieces.map((piece) => {
    const seed = stage * 1000 + piece.id;
    /* A loose slot each, walked with a step of 4 — coprime with 9, so every
       piece lands somewhere different from where it belongs in the picture. */
    const slot = (stage + piece.id * 4) % PUZZLE_PIECES;

    return {
      piece,
      x:
        SLOT_ORIGIN +
        (slot % PUZZLE_COLS) * SLOT_STEP +
        (hash(seed) - 0.5) * 2 * SCATTER_X,
      y:
        SLOT_ORIGIN +
        Math.floor(slot / PUZZLE_COLS) * SLOT_STEP +
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
 * slice of the picture — the classic sprite crop, one file and nine crops.
 *
 * The image is drawn at the size of the whole board and pushed left and up by
 * whole cells until the wanted one lands in the box, offset by the tab depth
 * so the crop lines up with the piece's CORE rather than its grown box.
 */
export function pieceCropStyle(piece: PuzzlePiece): CSSProperties {
  return {
    position: "absolute",
    width: `calc(var(--cell-w) * ${PUZZLE_COLS})`,
    height: `calc(var(--cell-h) * ${PUZZLE_ROWS})`,
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
