"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import Image from "next/image";
import { RotateCcw } from "lucide-react";
import { PUZZLE_COLS, PUZZLE_PIECES, PUZZLE_ROWS } from "@/data/puzzles";
import type { PuzzlePicture } from "@/types/puzzle";
import {
  pieceCropStyle,
  puzzlePieces,
  slotStyle,
  trayOrder,
} from "@/lib/puzzle-pieces";
import type { PuzzlePiece } from "@/lib/puzzle-pieces";
import { puzzleKey, useProgress } from "@/store/progress";
import { Button3D } from "@/components/ui/button-3d";
import { Celebration } from "@/components/learn/number/celebration";
import { StarReward } from "@/components/learn/number/star-reward";

interface PuzzleBoardProps {
  stage: number;
  picture: PuzzlePicture;
}

/** How far outside its own cell a drop still counts, as a share of the cell.
    Generous on purpose: only the piece's OWN cell is ever tested, so being
    forgiving can never drop a piece into the wrong hole. */
const CATCH_PAD = 0.45;
/** Below this the pointer never really moved. A tap does nothing — carrying
    the piece across IS the exercise, same call `NumberComplete` makes. */
const DRAG_THRESHOLD = 6;
/** Tray pieces sit smaller than their slot so nine of them stay a compact
    strip; a carried piece grows back to exactly slot size. */
const TRAY_SCALE = 0.8;
const WIGGLE_MS = 500;

/** The board never gets wider than this, and never wider than the phone it is
    on. Viewport units rather than `%` on purpose: the tray is a different
    container, and both have to derive the exact same piece size from it. */
const BOARD_WIDTH = "min(100vw - 4rem, 32rem)";

function starsFor(mistakes: number): number {
  if (mistakes <= 2) return 3;
  if (mistakes <= 6) return 2;
  /* Never 0: finishing the picture at all is the achievement. */
  return 1;
}

interface DragState {
  id: number;
  startX: number;
  startY: number;
  dx: number;
  dy: number;
  moved: boolean;
}

/** One piece of the picture. The box is piece-sized and the image inside it is
    drawn at 300% and pushed off-centre, so only this piece's cell shows —
    one file, nine crops, no SVG and no slicing. */
function PieceArt({
  picture,
  piece,
  className = "",
  style,
}: {
  picture: PuzzlePicture;
  piece: PuzzlePiece;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={`relative block overflow-hidden ${className}`}
      style={style}
    >
      <Image
        src={picture.src}
        alt=""
        width={picture.width}
        height={picture.height}
        sizes="(min-width: 640px) 32rem, 100vw"
        /* Images are natively draggable: without this the browser's own image
           drag starts instead, firing `pointercancel` and killing the custom
           drag on its first move. */
        draggable={false}
        className="pointer-events-none select-none"
        style={pieceCropStyle(piece)}
      />
    </span>
  );
}

/**
 * One puzzle: an empty board with the nine slots outlined, and a tray of
 * loose pieces underneath to carry into them.
 *
 * The pieces are CSS crops of a single image (`lib/puzzle-pieces.ts`) rather
 * than nine files or an SVG — the same sprite-crop trick `NumberComplete`
 * already uses for its missing-piece activity. They are plain rectangles for
 * the same reason that one is: a square piece reads clearly to a small child
 * and needs no per-pixel masking.
 *
 * A drop counts when the piece's centre lands in (or near) its OWN cell.
 * Nothing else is ever tested, so being forgiving cannot put a piece in the
 * wrong hole — a miss simply springs back with a wiggle and no telling-off,
 * matching the rest of the site.
 */
export function PuzzleBoard({ stage, picture }: PuzzleBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const wiggleTimer = useRef<number | null>(null);
  const complete = useProgress((state) => state.complete);

  const [placed, setPlaced] = useState<number[]>([]);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [wrongId, setWrongId] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);

  /* Derived, never stored: a second copy could drift out of sync. */
  const solved = placed.length === PUZZLE_PIECES;
  const tray = trayOrder(stage).filter((piece) => !placed.includes(piece.id));

  useEffect(() => {
    return () => {
      if (wiggleTimer.current !== null) window.clearTimeout(wiggleTimer.current);
    };
  }, []);

  const flashWrong = (id: number) => {
    setWrongId(id);
    if (wiggleTimer.current !== null) window.clearTimeout(wiggleTimer.current);
    wiggleTimer.current = window.setTimeout(() => setWrongId(null), WIGGLE_MS);
  };

  const onPointerDown = (
    event: ReactPointerEvent<HTMLButtonElement>,
    piece: PuzzlePiece,
  ) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({
      id: piece.id,
      startX: event.clientX,
      startY: event.clientY,
      dx: 0,
      dy: 0,
      moved: false,
    });
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!drag) return;
    /* Deltas from the pointerdown position, never accumulated `movementX` —
       that is unreliable enough across touch and pen input that dragging
       effectively stops working. */
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    setDrag({
      ...drag,
      dx,
      dy,
      moved: drag.moved || Math.hypot(dx, dy) > DRAG_THRESHOLD,
    });
  };

  const releaseCapture = (event: ReactPointerEvent<HTMLButtonElement>) => {
    /* On `pointercancel` the browser has already released the capture, and
       releasing it twice throws `NotFoundError` — which would abort the rest
       of this handler and leave a piece stuck to the pointer. */
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const onPointerUp = (
    event: ReactPointerEvent<HTMLButtonElement>,
    piece: PuzzlePiece,
  ) => {
    if (!drag) return;
    releaseCapture(event);

    /* A tap just puts it back down — nothing is wrong, there is simply
       nothing to judge until the piece has actually been carried. */
    if (!drag.moved) {
      setDrag(null);
      return;
    }

    const board = boardRef.current?.getBoundingClientRect();
    const box = event.currentTarget.getBoundingClientRect();

    if (board) {
      const cellW = board.width / PUZZLE_COLS;
      const cellH = board.height / PUZZLE_ROWS;
      const offX = Math.abs(
        box.left + box.width / 2 - (board.left + (piece.col + 0.5) * cellW),
      );
      const offY = Math.abs(
        box.top + box.height / 2 - (board.top + (piece.row + 0.5) * cellH),
      );

      if (offX <= cellW * (0.5 + CATCH_PAD) && offY <= cellH * (0.5 + CATCH_PAD)) {
        const next = [...placed, piece.id];
        setPlaced(next);
        setDrag(null);
        /* Recorded the moment the picture is whole, in the handler that made
           it whole — not in an effect watching for it. */
        if (next.length === PUZZLE_PIECES) {
          complete(puzzleKey(stage), starsFor(mistakes));
        }
        return;
      }
    }

    flashWrong(piece.id);
    setMistakes((count) => count + 1);
    setDrag(null);
  };

  const reset = () => {
    setPlaced([]);
    setMistakes(0);
    setWrongId(null);
    setDrag(null);
  };

  const sizing = {
    "--puzzle-w": BOARD_WIDTH,
    /* One cell, at slot size. The tray derives its own smaller piece from the
       same value, so a carried piece is always exactly slot-sized. */
    "--cell-w": `calc(var(--puzzle-w) / ${PUZZLE_COLS})`,
    "--cell-h": `calc(var(--puzzle-w) * ${picture.height} / ${picture.width} / ${PUZZLE_ROWS})`,
  } as CSSProperties;

  return (
    <div className="flex flex-col items-center gap-4 sm:gap-6" style={sizing}>
      {/* The board: empty to start, with every slot outlined so a child can
          see where the pieces go and what shape they are. */}
      <div className="card relative p-3 sm:p-4">
        <div
          ref={boardRef}
          role="group"
          aria-label={`Puzzle board — ${picture.alt}`}
          className="relative overflow-hidden rounded-2xl"
          style={{
            width: "var(--puzzle-w)",
            aspectRatio: `${picture.width} / ${picture.height}`,
          }}
        >
          {puzzlePieces.map((piece) => (
            <div key={piece.id} className="absolute" style={slotStyle(piece)}>
              {placed.includes(piece.id) ? (
                <PieceArt
                  picture={picture}
                  piece={piece}
                  className="anim-pop-in h-full w-full"
                />
              ) : (
                <span
                  aria-hidden
                  className="absolute inset-[2px] rounded-lg border-2 border-dashed border-[var(--color-locked-dark)]"
                />
              )}
            </div>
          ))}

          {/* Once every piece is home the whole picture fades in over the
              nine crops, so the finished puzzle can never show a hairline
              seam between them. */}
          <Image
            src={picture.src}
            alt={solved ? picture.alt : ""}
            fill
            sizes="(min-width: 640px) 32rem, 100vw"
            aria-hidden={!solved}
            className={`object-cover transition-opacity duration-500 ${
              solved ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>

        {solved && <Celebration />}
      </div>

      {solved ? (
        <div className="anim-pop-in flex flex-col items-center gap-4">
          <StarReward stars={starsFor(mistakes)} />
          <Button3D
            tone={{ face: "var(--color-go)", edge: "var(--color-go-dark)" }}
            onClick={reset}
            className="px-6 py-3 text-base"
          >
            <RotateCcw className="h-5 w-5" strokeWidth={2.75} />
            Play again
          </Button3D>
        </div>
      ) : (
        /* The tray: shorter than the board, and it shrinks as it empties.
            No `overflow-hidden` — a carried piece has to be able to leave it.
            Its content box is pinned to the board's own width, and it carries
            the same padding, so the two cards line up exactly. */
        <div className="card p-3 sm:p-4">
          <div
            className="flex min-h-[5rem] flex-wrap items-center justify-center gap-2 sm:gap-3"
            style={{ width: "var(--puzzle-w)" }}
          >
            {tray.map((piece) => {
              const carrying = drag?.id === piece.id && drag.moved;

              return (
                <button
                  key={piece.id}
                  type="button"
                  onPointerDown={(event) => onPointerDown(event, piece)}
                  onPointerMove={onPointerMove}
                  onPointerUp={(event) => onPointerUp(event, piece)}
                  onPointerCancel={(event) => {
                    releaseCapture(event);
                    setDrag(null);
                  }}
                  aria-label={`Puzzle piece ${piece.id + 1} of ${PUZZLE_PIECES}`}
                  /* `touch-none` or the drag scrolls the page instead of
                     moving the piece. `z-50` while carried so it rides above
                     the board card, which sits earlier in the DOM. */
                  className={`touch-none rounded-xl ${
                    carrying ? "relative z-50" : "transition-all duration-300"
                  } ${wrongId === piece.id ? "anim-wiggle" : ""}`}
                  style={{
                    translate: carrying
                      ? `${drag.dx}px ${drag.dy}px`
                      : undefined,
                    /* Carried pieces grow to exactly slot size. `scale` is
                       centred, so the drop test's centre maths is
                       unaffected. */
                    scale: carrying ? String(1 / TRAY_SCALE) : "1",
                  }}
                >
                  <PieceArt
                    picture={picture}
                    piece={piece}
                    className="rounded-lg"
                    style={{
                      width: `calc(var(--cell-w) * ${TRAY_SCALE})`,
                      height: `calc(var(--cell-h) * ${TRAY_SCALE})`,
                      filter:
                        "drop-shadow(0 8px 12px rgb(var(--shadow-hue) / 35%))",
                    }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
