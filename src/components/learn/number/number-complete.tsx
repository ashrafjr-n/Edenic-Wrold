"use client";

import { useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import Image from "next/image";
import { completeNotchFor } from "@/data/number-complete";

interface NumberCompleteProps {
  value: number;
  image: string;
  onFinish: () => void;
  onMiss: () => void;
}

/** The numeral PNGs' own pixel size. The piece's crop math and the hole's
    position both read the notch rect against this exact box, edge to edge —
    no `object-contain` letterboxing to throw the percentages off, because
    the board below is sized to this same ratio. */
const IMAGE_W = 426;
const IMAGE_H = 585;

/** Below this the pointer never really moved — a tap, not a drag. A tap
    always places the piece, same convention as `AppleGive`'s tap-to-give:
    dragging shouldn't be required to pass a stage a four-year-old cannot
    yet aim precisely. */
const DRAG_THRESHOLD = 8;
/** How long the piece takes to fly from wherever it was released into the
    hole, once a drop (or a tap) succeeds. */
const SNAP_MS = 320;

interface DragState {
  startX: number;
  startY: number;
  dx: number;
  dy: number;
  moved: boolean;
}

/** The inner, oversized `<Image>` that makes a small tray box show only the
    notch's own slice of the full numeral — the classic sprite-crop trick,
    done with percentages so it stays correct at any size. */
function cropStyle(notch: { x: number; y: number; w: number; h: number }): CSSProperties {
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
 * sits in a tray beside it; the child drags (or taps) it back into place.
 *
 * The notch is a plain rectangle rather than a shape cut around the glyph's
 * own silhouette — a jigsaw-style square reads clearly to a small child and
 * needs no per-pixel masking. The "hole" is simply a `--surface`-colored
 * rectangle painted over that part of the numeral (the pixels are still
 * there underneath), so completing it is just making that rectangle
 * disappear — no clip-path or mask involved.
 */
export function NumberComplete({
  value,
  image,
  onFinish,
  onMiss,
}: NumberCompleteProps) {
  const notch = completeNotchFor(value);
  const holeRef = useRef<HTMLDivElement>(null);

  const [drag, setDrag] = useState<DragState | null>(null);
  const [snap, setSnap] = useState<{ dx: number; dy: number } | null>(null);
  const [solved, setSolved] = useState(false);
  const [wrong, setWrong] = useState(false);

  const locked = solved || snap !== null;

  const snapToHole = (pieceRect: DOMRect) => {
    const hole = holeRef.current?.getBoundingClientRect();
    if (!hole) return;

    setSnap({
      dx: (drag?.dx ?? 0) + (hole.left + hole.width / 2) - (pieceRect.left + pieceRect.width / 2),
      dy: (drag?.dy ?? 0) + (hole.top + hole.height / 2) - (pieceRect.top + pieceRect.height / 2),
    });
    window.setTimeout(() => {
      setSolved(true);
      onFinish();
    }, SNAP_MS);
  };

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

    const pieceRect = event.currentTarget.getBoundingClientRect();
    const hole = holeRef.current?.getBoundingClientRect();

    if (!drag.moved) {
      /* A tap: always succeeds, same reasoning as AppleGive's tap-to-give —
         there is only one place this piece can go. */
      snapToHole(pieceRect);
      setDrag(null);
      return;
    }

    const closeEnough =
      hole &&
      Math.hypot(
        pieceRect.left + pieceRect.width / 2 - (hole.left + hole.width / 2),
        pieceRect.top + pieceRect.height / 2 - (hole.top + hole.height / 2),
      ) <=
        Math.max(hole.width, hole.height) * 0.9;

    if (closeEnough) {
      snapToHole(pieceRect);
    } else {
      setWrong(true);
      window.setTimeout(() => setWrong(false), 500);
      onMiss();
    }
    setDrag(null);
  };

  return (
    <div className="card anim-rise-in flex flex-col items-center gap-5 p-5 sm:gap-7 sm:p-7">
      <div
        className="relative mx-auto h-52 sm:h-64"
        style={{ aspectRatio: `${IMAGE_W} / ${IMAGE_H}` }}
      >
        <Image
          src={image}
          alt={`The number ${value}`}
          fill
          sizes="(min-width: 640px) 13rem, 10rem"
          className="object-contain"
        />

        {/* The hole: a plain rectangle painted the same white as the card
            behind it, so it reads as "this part is missing" rather than as
            a shape cut out of the image. Fades away once the piece lands,
            revealing the pixels that were underneath all along. */}
        <div
          ref={holeRef}
          className={`absolute rounded-2xl border-[3px] border-dashed border-[var(--color-locked-dark)] bg-[var(--surface)] transition-opacity duration-300 ${
            solved ? "opacity-0" : "opacity-100"
          }`}
          style={{
            left: `${notch.x}%`,
            top: `${notch.y}%`,
            width: `${notch.w}%`,
            height: `${notch.h}%`,
          }}
          aria-hidden
        />
      </div>

      <button
        type="button"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => setDrag(null)}
        disabled={locked}
        aria-label="Drag the missing piece back into the number"
        /* `touch-action: none` or the drag scrolls the page instead — same
           reason AppleGive needs it. */
        className={`relative touch-none overflow-hidden rounded-2xl shadow-[0_10px_20px_-10px_rgb(var(--shadow-hue)/40%)] ${
          drag?.moved || snap ? "" : "transition-all duration-300"
        } ${wrong ? "anim-wiggle" : ""} ${solved ? "pointer-events-none" : ""}`}
        style={{
          width: "6rem",
          aspectRatio: `${notch.w * IMAGE_W} / ${notch.h * IMAGE_H}`,
          translate: drag?.moved
            ? `${drag.dx}px ${drag.dy}px`
            : snap
              ? `${snap.dx}px ${snap.dy}px`
              : undefined,
          scale: drag?.moved ? "1.08" : "1",
        }}
      >
        <Image
          src={image}
          alt=""
          width={IMAGE_W}
          height={IMAGE_H}
          className="pointer-events-none select-none"
          style={cropStyle(notch)}
        />
      </button>
    </div>
  );
}
