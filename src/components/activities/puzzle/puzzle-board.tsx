"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import Image from "next/image";
import { RotateCcw } from "lucide-react";
import { PUZZLE_COLS, PUZZLE_PIECES, PUZZLE_ROWS } from "@/data/puzzles";
import type { PuzzlePicture } from "@/types/puzzle";
import {
  pieceBoxStyle,
  pieceCropStyle,
  puzzlePieces,
  slotStyle,
  trayLayout,
} from "@/lib/puzzle-pieces";
import type { PuzzlePiece } from "@/lib/puzzle-pieces";
import { TAB_DEPTH, clipId, piecePath } from "@/lib/puzzle-shape";
import { puzzleKey, useProgress } from "@/store/progress";
import { Button3D } from "@/components/ui/button-3d";
import { Celebration } from "@/components/learn/number/celebration";
import { StarReward } from "@/components/learn/number/star-reward";

interface PuzzleBoardProps {
  stage: number;
  picture: PuzzlePicture;
}

/** Below this the pointer never really moved. A tap does nothing — carrying
    the piece across IS the exercise, same call `NumberComplete` makes. */
const DRAG_THRESHOLD = 6;
/** Loose pieces lie smaller than their slot; picking one up brings it back to
    full size and straightens it. */
const TRAY_SCALE = 0.72;
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

/**
 * One piece of the picture: the box holds the crop, the clip path cuts the
 * jigsaw outline out of it.
 *
 * The drop shadow sits on the OUTER span rather than the clipped one — a
 * filter is applied before the clip on the same element, so a shadow declared
 * there would be cut away with everything else outside the outline. From a
 * parent it follows the piece's real silhouette instead.
 */
function PieceArt({
  picture,
  piece,
  shadow = true,
}: {
  picture: PuzzlePicture;
  piece: PuzzlePiece;
  shadow?: boolean;
}) {
  return (
    <span
      className="block"
      style={{
        ...pieceBoxStyle,
        filter: shadow
          ? "drop-shadow(0 6px 8px rgb(var(--shadow-hue) / 40%))"
          : undefined,
      }}
    >
      <span
        className="relative block h-full w-full"
        style={{ clipPath: `url(#${clipId(piece.id)})` }}
      >
        <Image
          src={picture.src}
          alt=""
          width={picture.width}
          height={picture.height}
          sizes="(min-width: 640px) 32rem, 100vw"
          /* Images are natively draggable: without this the browser's own
             image drag starts instead, firing `pointercancel` and killing the
             custom drag on its first move. */
          draggable={false}
          className="pointer-events-none select-none"
          style={pieceCropStyle(piece)}
        />
      </span>
    </span>
  );
}

/**
 * One puzzle: a board showing the empty jigsaw holes, and a heap of loose
 * pieces below to carry into them.
 *
 * The nine pieces are CSS crops of a SINGLE image — never nine files — cut to
 * real interlocking jigsaw outlines by an SVG clip path each
 * (`lib/puzzle-shape.ts`). Neighbouring pieces read the same edge table, so a
 * tab and the socket it drops into are the same curve by construction.
 *
 * A drop counts as soon as the piece OVERLAPS its own hole at all — it never
 * has to be lined up. Only the piece's own hole is ever tested, so being that
 * forgiving still can't put a piece in the wrong place. A miss springs back
 * with a wiggle and no telling-off, matching the rest of the site.
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
  const loose = trayLayout(stage).filter(
    (spot) => !placed.includes(spot.piece.id),
  );

  /* A cell's width over its height — what keeps the knobs round on screen
     even though the cells are much wider than they are tall. */
  const cellRatio =
    (picture.width / PUZZLE_COLS) / (picture.height / PUZZLE_ROWS);

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

      /* Overlapping its own hole is enough — the two rects touching. A child
         should never have to line a piece up, and since no other hole is ever
         tested, this cannot land a piece somewhere wrong. */
      if (
        offX <= (cellW + box.width) / 2 &&
        offY <= (cellH + box.height) / 2
      ) {
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
    "--cell-w": `calc(var(--puzzle-w) / ${PUZZLE_COLS})`,
    "--cell-h": `calc(var(--puzzle-w) * ${picture.height} / ${picture.width} / ${PUZZLE_ROWS})`,
    /* How far a knob sticks out past its cell — every piece box is grown by
       this on all four sides. Measured off the cell's short side so knobs are
       the same size on every edge. */
    "--tab": `calc(var(--cell-h) * ${TAB_DEPTH})`,
  } as CSSProperties;

  return (
    <div className="flex flex-col items-center gap-4 sm:gap-6" style={sizing}>
      {/* The nine outlines, defined once. `objectBoundingBox` units mean one
          definition scales to whatever size the board is drawn at. */}
      <svg width="0" height="0" aria-hidden className="absolute">
        <defs>
          {puzzlePieces.map((piece) => (
            <clipPath
              key={piece.id}
              id={clipId(piece.id)}
              clipPathUnits="objectBoundingBox"
            >
              <path d={piecePath(piece, cellRatio)} />
            </clipPath>
          ))}
        </defs>
      </svg>

      <div className="card relative p-3 sm:p-4">
        <div
          ref={boardRef}
          role="group"
          aria-label={`Puzzle board — ${picture.alt}`}
          className="relative overflow-hidden rounded-2xl bg-[var(--color-locked)]/40"
          style={{
            width: "var(--puzzle-w)",
            aspectRatio: `${picture.width} / ${picture.height}`,
          }}
        >
          {puzzlePieces.map((piece) => {
            const isPlaced = placed.includes(piece.id);

            return (
              <div
                key={piece.id}
                className="absolute"
                style={{ ...slotStyle(piece), ...pieceBoxStyle }}
              >
                {isPlaced ? (
                  <span className="anim-pop-in block">
                    <PieceArt picture={picture} piece={piece} shadow={false} />
                  </span>
                ) : (
                  /* The hole, drawn as the piece's own outline rather than a
                     dashed box — a child can see the shape that belongs
                     here, not just the area. `non-scaling-stroke` keeps the
                     line an even width despite the viewBox being stretched. */
                  <svg
                    viewBox="0 0 1 1"
                    preserveAspectRatio="none"
                    aria-hidden
                    className="h-full w-full"
                  >
                    <path
                      d={piecePath(piece, cellRatio)}
                      vectorEffect="non-scaling-stroke"
                      strokeWidth={2}
                      strokeDasharray="5 4"
                      style={{
                        fill: "var(--color-locked)",
                        fillOpacity: 0.5,
                        stroke: "var(--color-locked-text)",
                      }}
                    />
                  </svg>
                )}
              </div>
            );
          })}

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
        /* The loose pieces, tipped out in a heap rather than lined up: each
           lies at its own angle and they overlap. No `overflow-hidden` — a
           carried piece has to be able to leave the card. */
        <div className="card p-3 sm:p-4">
          <div
            className="relative"
            style={{
              width: "var(--puzzle-w)",
              height: "calc(var(--cell-h) * 3.9)",
            }}
          >
            {loose.map((spot, index) => {
              const piece = spot.piece;
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
                     moving the piece. */
                  className={`absolute touch-none ${
                    wrongId === piece.id ? "anim-wiggle" : ""
                  }`}
                  style={{
                    left: `${spot.x}%`,
                    top: `${spot.y}%`,
                    /* The centring has to live inside the same `translate`
                       the drag writes to — an inline `translate` replaces a
                       `-translate-x-1/2` utility outright, and the piece
                       would jump by half its own size on the first move. */
                    translate: carrying
                      ? `calc(-50% + ${drag.dx}px) calc(-50% + ${drag.dy}px)`
                      : "-50% -50%",
                    /* Picking a piece up straightens it and brings it to full
                       size, so it always matches the hole it is going into —
                       no rotating to fit, which is a mechanic a small child
                       does not need. */
                    rotate: carrying ? "0deg" : `${spot.rotate}deg`,
                    scale: carrying ? "1" : String(TRAY_SCALE),
                    zIndex: carrying ? 50 : index,
                    transition: carrying
                      ? "rotate 0.2s ease, scale 0.2s ease"
                      : "translate 0.3s ease, rotate 0.3s ease, scale 0.3s ease",
                  }}
                >
                  <PieceArt picture={picture} piece={piece} />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
