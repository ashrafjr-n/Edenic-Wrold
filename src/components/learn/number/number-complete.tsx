"use client";

import { useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import Image from "next/image";
import { COMPLETE_NOTCH } from "@/data/number-complete";
import type { CompleteNotch } from "@/data/number-complete";
import { format } from "@/lib/format-dict";
import type { Dictionary } from "@/lib/dictionaries/en";

interface NumberCompleteProps {
  dict: Dictionary["journey"];
  value: number;
  image: string;
  /** The render's own pixel size, so the board can take the numeral's OWN
      aspect — see the `--board-w` override below. */
  imageSize: { width: number; height: number };
  /** Mark the gap as the thing to aim for, until the piece is home.
      Presentation only — it changes nothing about how the drag works. The
      journey passes this exactly when Pinki is holding the stick, so the halo
      and the gesture arrive together or not at all. */
  highlightTarget?: boolean;
  onFinish: () => void;
  onMiss: () => void;
}

/** Below this the pointer never really moved. A tap does NOT solve this —
    putting the piece back IS the exercise, so it has to be carried there. */
const DRAG_THRESHOLD = 8;
/** How long the piece takes to settle into the hole once it lands close. */
const SNAP_MS = 300;
/** How far off the hole's centre still counts, as a share of the hole's own
    size. Forgiving enough for a fingertip, tight enough that the piece has to
    actually be brought to the gap. */
const CATCH_FACTOR = 0.85;

interface DragState {
  startX: number;
  startY: number;
  dx: number;
  dy: number;
  moved: boolean;
}

/** The oversized inner `<Image>` that makes the small piece box show only the
    notch's own slice of the numeral — the classic sprite-crop trick, done in
    percentages so it stays exact at any size. */
function cropStyle(notch: CompleteNotch): CSSProperties {
  return {
    position: "absolute",
    width: `${(100 / notch.w) * 100}%`,
    height: `${(100 / notch.h) * 100}%`,
    left: `${-(notch.x / notch.w) * 100}%`,
    top: `${-(notch.y / notch.h) * 100}%`,
    maxWidth: "none",
  };
}

/**
 * "Complete Number 4!" — a rectangular piece is missing from the numeral and
 * waits below it; the child drags it back into the gap.
 *
 * The piece is rendered at EXACTLY the hole's size, both derived from the same
 * `--board-w`/`--board-h` pair, because a piece that is even slightly bigger
 * than its gap never looks like it fits when it lands.
 *
 * **The cut is the numeral's whole BOTTOM HALF** (`COMPLETE_NOTCH`) — see that
 * constant for why it is one rectangle for all nine rather than a chunk tuned
 * per numeral. The notch is a plain rectangle rather than a shape cut around
 * the glyph's silhouette: a jigsaw-style square reads clearly to a small child
 * and needs no per-pixel masking. The "hole" is just a `--surface`-colored
 * rectangle painted over that part of the numeral (the pixels are still
 * underneath), so completing it is only a matter of fading that rectangle
 * away.
 *
 * Dragging is required: a tap does nothing. Carrying the piece to the gap is
 * the whole exercise, so solving it by tapping would skip the activity.
 */
export function NumberComplete({
  value,
  image,
  imageSize,
  highlightTarget,
  onFinish,
  onMiss,
  dict,
}: NumberCompleteProps) {
  const notch = COMPLETE_NOTCH;
  const holeRef = useRef<HTMLDivElement>(null);

  const [drag, setDrag] = useState<DragState | null>(null);
  const [snap, setSnap] = useState<{ dx: number; dy: number } | null>(null);
  const [solved, setSolved] = useState(false);
  const [wrong, setWrong] = useState(false);

  const locked = solved || snap !== null;
  const dragging = drag?.moved ?? false;

  const onPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (locked) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ startX: event.clientX, startY: event.clientY, dx: 0, dy: 0, moved: false });
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!drag) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    setDrag({
      ...drag,
      dx,
      dy,
      moved: drag.moved || Math.hypot(dx, dy) > DRAG_THRESHOLD,
    });
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!drag) return;
    event.currentTarget.releasePointerCapture(event.pointerId);

    /* A tap just puts it back down — nothing is wrong, there is simply
       nothing to score until the piece has actually been carried. */
    if (!drag.moved) {
      setDrag(null);
      return;
    }

    const piece = event.currentTarget.getBoundingClientRect();
    const hole = holeRef.current?.getBoundingClientRect();
    const offBy = hole
      ? Math.hypot(
          piece.left + piece.width / 2 - (hole.left + hole.width / 2),
          piece.top + piece.height / 2 - (hole.top + hole.height / 2),
        )
      : Infinity;

    if (hole && offBy <= Math.max(hole.width, hole.height) * CATCH_FACTOR) {
      /* Land it dead centre in the gap rather than wherever it was let go:
         the piece and the hole are the same size, so anything less than exact
         reads as a piece sitting crookedly on top of the number. */
      setSnap({
        dx: drag.dx + (hole.left + hole.width / 2) - (piece.left + piece.width / 2),
        dy: drag.dy + (hole.top + hole.height / 2) - (piece.top + piece.height / 2),
      });
      window.setTimeout(() => {
        setSolved(true);
        onFinish();
      }, SNAP_MS);
    } else {
      setWrong(true);
      window.setTimeout(() => setWrong(false), 500);
      onMiss();
    }
    setDrag(null);
  };

  return (
    /* **`--board-w` is overridden to THIS numeral's own aspect**, rather than
       taking `.numeral-stage`'s shared 426/585. The nine renders came off two
       different canvases, so on 1–3 the shared ratio letterboxed the image
       inside the board — and the hole is positioned in BOARD percent while
       the loose piece is cropped in IMAGE percent, so a letterbox quietly
       puts the two in different spaces. With the board on the image's own
       ratio there is nothing to letterbox and the two are the same box again.
       It was a couple of percent and invisible while the notch was a small
       chunk; at half the numeral it would show as a visible step where the
       piece lands. */
    <div
      className="card card-clay-white numeral-stage numeral-stage--half flex flex-col items-center gap-4 p-5 sm:gap-6 sm:p-7"
      style={
        {
          "--board-w": `calc(var(--board-h) * ${imageSize.width} / ${imageSize.height})`,
        } as CSSProperties
      }
    >
      <div
        className="relative"
        style={{ width: "var(--board-w)", height: "var(--board-h)" }}
      >
        <Image
          src={image}
          alt={format(dict.numberValue, { value })}
          fill
          sizes="(min-width: 640px) 14rem, 10rem"
          draggable={false}
          className="select-none object-contain"
        />

        {/* The gap, and the one place the piece belongs — so it is what the
            halo marks while Pinki points at it. It goes the instant the piece
            lands, along with the hole itself. */}
        <div
          ref={holeRef}
          className={`absolute rounded-xl border-2 border-dashed border-[var(--color-locked-dark)] bg-[var(--surface)] transition-opacity duration-300 ${
            solved ? "opacity-0" : "opacity-100"
          } ${highlightTarget && !solved ? "guide-target" : ""}`}
          style={{
            left: `${notch.x}%`,
            top: `${notch.y}%`,
            width: `${notch.w}%`,
            height: `${notch.h}%`,
          }}
          aria-hidden
        />
      </div>

      {/* The loose piece. The button carries padding so the touch target stays
          comfortably bigger than the piece itself, which is pinned to the
          hole's exact size. */}
      <button
        type="button"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => setDrag(null)}
        disabled={solved}
        aria-label={dict.dragMissingPiece}
        /* `touch-action: none` or the drag scrolls the page instead. */
        className={`touch-none rounded-2xl p-3 ${
          dragging || snap ? "" : "transition-all duration-300"
        } ${wrong ? "anim-wiggle" : ""} ${
          !dragging && !snap && !solved ? "anim-breathe" : ""
        } ${solved ? "pointer-events-none" : ""}`}
        style={{
          translate: drag?.moved
            ? `${drag.dx}px ${drag.dy}px`
            : snap
              ? `${snap.dx}px ${snap.dy}px`
              : undefined,
          scale: dragging ? "1.06" : "1",
        }}
      >
        <span
          className="relative block overflow-hidden rounded-[0.6rem]"
          style={{
            width: `calc(var(--board-w) * ${notch.w} / 100)`,
            height: `calc(var(--board-h) * ${notch.h} / 100)`,
            /* The shadow is what makes the loose piece read as liftable —
               and exactly what would draw a seam around it once it's home. */
            filter: solved
              ? "none"
              : "drop-shadow(0 8px 12px rgb(var(--shadow-hue) / 35%))",
            transition: "filter 0.3s ease",
          }}
        >
          <Image
            src={image}
            alt=""
            width={imageSize.width}
            height={imageSize.height}
            draggable={false}
            className="pointer-events-none select-none"
            style={cropStyle(notch)}
          />
        </span>
      </button>
    </div>
  );
}
