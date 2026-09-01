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
 * The order the loose pieces sit in the tray.
 *
 * Deterministic, never `Math.random()`: the board renders on the server too,
 * and a random shuffle would hydrate mismatched — the same reason
 * `lib/number-choices.ts` walks a fixed step instead of shuffling. 4 is
 * coprime with 9, so the walk visits every piece exactly once, and starting
 * it from the stage number means two stages scatter differently.
 */
export function trayOrder(stage: number): PuzzlePiece[] {
  return Array.from(
    { length: PUZZLE_PIECES },
    (_, index) => puzzlePieces[(stage + index * 4) % PUZZLE_PIECES],
  );
}

/**
 * The oversized inner image that makes a piece-sized box show only that
 * piece's slice of the picture — the classic sprite crop, in percentages so
 * it stays exact at any size.
 *
 * A 3 × 3 grid means the image is drawn at 300% × 300% of the box and pushed
 * left/up by whole box-widths until the wanted cell is the part on show.
 */
export function pieceCropStyle(piece: PuzzlePiece): CSSProperties {
  return {
    position: "absolute",
    width: `${PUZZLE_COLS * 100}%`,
    height: `${PUZZLE_ROWS * 100}%`,
    left: `${-piece.col * 100}%`,
    top: `${-piece.row * 100}%`,
    maxWidth: "none",
  };
}

/** Where a piece's slot sits on the board, as percentages of the board. The
    cells are gapless on purpose: the assembled picture has no seams, and a
    drop can be tested with plain arithmetic off the board's own rect instead
    of a ref per slot. */
export function slotStyle(piece: PuzzlePiece): CSSProperties {
  return {
    left: `${(piece.col / PUZZLE_COLS) * 100}%`,
    top: `${(piece.row / PUZZLE_ROWS) * 100}%`,
    width: `${100 / PUZZLE_COLS}%`,
    height: `${100 / PUZZLE_ROWS}%`,
  };
}
