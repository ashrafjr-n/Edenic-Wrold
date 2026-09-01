"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import Image from "next/image";
import { ArrowRight, RotateCcw } from "lucide-react";
import type { PuzzleGrid, PuzzlePicture } from "@/types/puzzle";
import {
  pieceBoxStyle,
  pieceCropStyle,
  piecesFor,
  slotStyle,
  trayLayout,
  traySlots,
} from "@/lib/puzzle-pieces";
import type { PuzzlePiece } from "@/lib/puzzle-pieces";
import { TAB_DEPTH, clipId, piecePath } from "@/lib/puzzle-shape";
import { puzzleKey, useProgress } from "@/store/progress";
import { Button3D } from "@/components/ui/button-3d";
import { Celebration } from "@/components/learn/number/celebration";

interface PuzzleBoardProps {
  stage: number;
  picture: PuzzlePicture;
  /** How this stage's picture is cut up. Later stages get harder by adding
      pieces, so nothing here may assume 3 × 3. */
  grid: PuzzleGrid;
  /** The next puzzle, or back to the list when there isn't a playable one. */
  nextHref: string;
}

/** Below this the pointer never really moved. A tap does nothing — carrying
    the piece across IS the exercise, same call `NumberComplete` makes. */
const DRAG_THRESHOLD = 6;
/** Loose pieces lie smaller than their slot; picking one up brings it back to
    full size and straightens it. */
const TRAY_SCALE = 0.72;
const WIGGLE_MS = 500;

/** Puzzles are not scored — the finished picture is the reward, and stars
    here would be a second currency next to the lessons' own. The store still
    needs a non-zero value to read the stage as finished, so every completion
    records the same one. */
const DONE = 3;

/** The widest anything here is ever drawn, and never wider than the phone it
    is on. It is the tray's width always, and a LANDSCAPE board's too; a
    an upright board is capped by height instead (see `--puzzle-w` below).
    Viewport units rather than `%` on purpose: the board and the tray are
    different containers, and both have to derive the same piece size. */
const AVAILABLE_WIDTH = "min(100vw - 4rem, 32rem)";

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
  grid,
  shadow = true,
  hitArea = false,
}: {
  picture: PuzzlePicture;
  piece: PuzzlePiece;
  grid: PuzzleGrid;
  shadow?: boolean;
  /** Makes the clipped shape itself the only part that answers a pointer.
      Loose pieces overlap in a heap, and a piece box is a RECTANGLE — without
      this, a piece's empty corners sit on top of its neighbours and a tap
      picks up something the child cannot even see. `clip-path` clips
      hit-testing as well as pixels, so the silhouette becomes the target. */
  hitArea?: boolean;
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
      {/* `overflow-hidden` as well as the clip path, and it is load-bearing:
          the image inside is drawn at THREE TIMES the board's size and pushed
          off-centre, and `clip-path` only hides it — it does not contain the
          layout. Without this the page's scroll width grew past the viewport,
          which on a phone widens the layout viewport itself, zooms the whole
          page out and drags every `position: fixed` overlay off-screen with
          it. */}
      <span
        className={`relative block h-full w-full overflow-hidden ${
          hitArea ? "pointer-events-auto" : ""
        }`}
        style={{ clipPath: `url(#${clipId(piece.id)})` }}
      >
        <Image
          src={picture.image}
          alt=""
          sizes="(min-width: 640px) 32rem, 100vw"
          /* Images are natively draggable: without this the browser's own
             image drag starts instead, firing `pointercancel` and killing the
             custom drag on its first move. */
          draggable={false}
          className="pointer-events-none select-none"
          style={pieceCropStyle(piece, grid)}
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
export function PuzzleBoard({
  stage,
  picture,
  grid,
  nextHref,
}: PuzzleBoardProps) {
  const pieces = piecesFor(grid);
  const total = pieces.length;
  const { width, height } = picture.image;
  /* Everything that has to bend for a picture that is not WIDE reads this one
     flag: the board's own cap, the shape of the heap, and whether the two sit
     side by side rather than stacked. Square counts — a square board leaves a
     phone just as little room for the heap underneath it as a tall one did. */
  const upright = height >= width;
  const slots = traySlots(grid, upright);
  const boardRef = useRef<HTMLDivElement>(null);
  const wiggleTimer = useRef<number | null>(null);
  const complete = useProgress((state) => state.complete);

  const [placed, setPlaced] = useState<number[]>([]);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [wrongId, setWrongId] = useState<number | null>(null);

  /* Derived, never stored: a second copy could drift out of sync. */
  const solved = placed.length === total;
  const loose = trayLayout(stage, grid, slots).filter(
    (spot) => !placed.includes(spot.piece.id),
  );

  /* A cell's width over its height — what keeps the knobs round on screen
     whichever way round the cell is. */
  const cellRatio = (width / grid.cols) / (height / grid.rows);

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
      const cellW = board.width / grid.cols;
      const cellH = board.height / grid.rows;
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
        if (next.length === total) {
          complete(puzzleKey(stage), DONE);
        }
        return;
      }
    }

    flashWrong(piece.id);
    setDrag(null);
  };

  const reset = () => {
    setPlaced([]);
    setWrongId(null);
    setDrag(null);
  };

  /* Stacked, the board and the heap share one budget (`--puzzle-space` in
     `globals.css`), and this is the board's share of it. The heap is
     `slots.rows + 0.9` cells tall and a cell is a fifth (or a quarter…) of
     the board, so the ratio between the two is fixed by the stage's cut
     alone — which is why it can be handed to CSS as a plain number and
     multiplied there. Passed as the BOARD's share rather than the heap's so
     the stylesheet never has to divide by a variable. */
  const heapShare = (slots.rows + 0.9) / grid.rows;
  const boardShare = (1 / (1 + heapShare)).toFixed(4);

  const sizing = {
    /* An upright board takes whichever is smaller: the width every board is
       allowed, or the width its own aspect ratio needs to fit the height cap
       `.puzzle-upright` sets. A landscape one never comes near that cap, so
       it keeps the plain width. */
    "--puzzle-w": upright
      ? `min(${AVAILABLE_WIDTH}, var(--board-max-h) * ${width} / ${height})`
      : AVAILABLE_WIDTH,
    ...(upright ? { "--board-share": boardShare } : {}),
    /* A landscape stage's heap is always the same width as its board. An
       upright one's changes at the breakpoint where the heap moves beside
       the board, so it comes from `.puzzle-upright` in `globals.css`
       instead — an inline custom property would beat the stylesheet and it
       could never switch. */
    ...(upright ? {} : { "--tray-w": AVAILABLE_WIDTH }),
    "--cell-w": `calc(var(--puzzle-w) / ${grid.cols})`,
    "--cell-h": `calc(var(--puzzle-w) * ${height} / ${width} / ${grid.rows})`,
    /* How far a knob sticks out past its cell — every piece box is grown by
       this on all four sides. Measured off whichever side of the cell is
       shorter, so knobs are the same size on every edge (`metrics()` in
       `lib/puzzle-shape.ts` normalises the outline the same way). */
    "--tab": `calc(min(var(--cell-w), var(--cell-h)) * ${TAB_DEPTH})`,
  } as CSSProperties;

  return (
    <div
      className={`flex flex-col items-center gap-4 sm:gap-6 ${
        upright ? "puzzle-upright" : ""
      }`}
      style={sizing}
    >
      {/* The nine outlines, defined once. `objectBoundingBox` units mean one
          definition scales to whatever size the board is drawn at. */}
      <svg width="0" height="0" aria-hidden className="absolute">
        <defs>
          {pieces.map((piece) => (
            <clipPath
              key={piece.id}
              id={clipId(piece.id)}
              clipPathUnits="objectBoundingBox"
            >
              <path d={piecePath(piece, cellRatio, grid)} />
            </clipPath>
          ))}
        </defs>
      </svg>

      {/* Board and heap. Stacked, except for an upright picture from `lg` up,
          where they sit side by side — a child must never be looking at the
          pieces with the board off-screen, and on a wide screen a row is what
          keeps both on it at a decent size. Below `lg` there is no width for
          a row, so they stay stacked and are sized to fit the screen together
          instead (`.puzzle-upright` in `globals.css`). */}
      <div
        className={`flex flex-col items-center gap-4 sm:gap-6 ${
          upright ? "lg:flex-row lg:items-center" : ""
        }`}
      >
        <div className="card relative p-3 sm:p-4">
          <div
            ref={boardRef}
            role="group"
            aria-label={`Puzzle board — ${picture.alt}`}
            className="relative overflow-hidden rounded-2xl bg-[var(--color-locked)]/40"
            style={{
              width: "var(--puzzle-w)",
              aspectRatio: `${width} / ${height}`,
            }}
          >
            {pieces.map((piece) => {
              const isPlaced = placed.includes(piece.id);

              return (
                <div
                  key={piece.id}
                  className="absolute"
                  style={{ ...slotStyle(piece), ...pieceBoxStyle }}
                >
                  {isPlaced ? (
                    <span className="anim-pop-in block">
                      <PieceArt
                        picture={picture}
                        piece={piece}
                        grid={grid}
                        shadow={false}
                      />
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
                        d={piecePath(piece, cellRatio, grid)}
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
              src={picture.image}
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

        {/* The loose pieces, tipped out in a heap rather than lined up: each
            lies at its own angle and they overlap. No `overflow-hidden` — a
            carried piece has to be able to leave the card. */}
        {!solved && (
          <div className="card p-3 sm:p-4">
            <div
              className="relative"
              style={{
                width: "var(--tray-w)",
                height: `calc(var(--cell-h) * ${slots.rows + 0.9})`,
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
                    aria-label={`Puzzle piece ${piece.id + 1} of ${total}`}
                    /* `touch-none` or the drag scrolls the page instead of
                       moving the piece. */
                    /* `pointer-events-none` on the button, `auto` on the
                       clipped art inside it (see `PieceArt`'s `hitArea`): the
                       button's own box is a rectangle, and in a heap of
                       overlapping pieces that rectangle would steal taps meant
                       for whatever is visible underneath it. Events still
                       bubble from the art to these handlers. */
                    className={`pointer-events-none absolute touch-none ${
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
                    <PieceArt
                      picture={picture}
                      piece={piece}
                      grid={grid}
                      hitArea
                    />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {solved && (
        /* No stars: the finished picture IS the reward here, and a second
           star currency next to the lessons' own would only muddy both. */
        <div className="anim-pop-in flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <Button3D
            variant="calm"
            tone={{ face: "var(--surface)", text: "var(--color-ink)" }}
            onClick={reset}
            className="btn3d--clay-white px-6 py-3 text-base sm:px-7 sm:text-lg"
          >
            <RotateCcw className="h-5 w-5" strokeWidth={2.75} />
            Again
          </Button3D>

          <Button3D
            tone={{ face: "var(--color-go)", edge: "var(--color-go-dark)" }}
            href={nextHref}
            className="px-6 py-3 text-base sm:px-7 sm:text-lg"
          >
            Next
            <ArrowRight className="h-5 w-5" strokeWidth={2.75} />
          </Button3D>
        </div>
      )}
    </div>
  );
}
