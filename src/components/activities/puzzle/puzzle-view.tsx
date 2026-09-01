"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X } from "lucide-react";
import type { PuzzlePicture } from "@/types/puzzle";
import { Button3D } from "@/components/ui/button-3d";

interface PuzzleViewProps {
  picture: PuzzlePicture;
}

/**
 * "View" — the finished picture, for a child who wants to know what they are
 * building.
 *
 * A blue clay circle at the top of the page opens the whole picture over the
 * board, with a cross to get straight back to the game. It's an overlay
 * rather than an `<iframe>`: the picture is a local asset already on the
 * page, so a frame would only cost a second document and lose the clay
 * framing around it.
 *
 * The overlay is PORTALLED to `document.body`. Rendered in place it sat
 * inside the header's `.anim-drop-in` wrapper, and an element running a CSS
 * animation makes its own stacking context — so `z-50` was measured against
 * its siblings inside that header rather than the page, and the board and
 * tray drew straight over the top of it.
 */
export function PuzzleView({ picture }: PuzzleViewProps) {
  /* No "have we mounted yet" flag: `open` starts false on the server AND on
     the first client render, and only a click can set it — by which point
     `document` certainly exists. So the portal is never reached during SSR
     and there is nothing to hydrate differently. */
  const [open, setOpen] = useState(false);

  /* Escape closes it — the one thing an overlay has to honour that a button
     cannot do on its own. Bound only while it is open, and cleaned up. */
  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const overlay = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="The finished picture"
      /* The scrim closes it too — a child who taps anywhere should get back
         to the puzzle rather than be trapped. */
      onClick={() => setOpen(false)}
      /* The scrim itself never animates: `pop-in` travels and overshoots, and
         on a full-screen dim that reads as the whole page lurching. It fades,
         the card pops. */
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-ink)]/70 p-7 sm:p-10"
    >
      <div
        className="card anim-pop-in relative w-full max-w-3xl p-3 sm:p-4"
        /* The picture itself is not a way out — only the scrim and the cross
           are. */
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="relative w-full overflow-hidden rounded-2xl"
          style={{ aspectRatio: `${picture.width} / ${picture.height}` }}
        >
          <Image
            src={picture.src}
            alt={picture.alt}
            fill
            sizes="(min-width: 768px) 48rem, 100vw"
            className="object-cover"
          />
        </div>

        {/* The wrapper carries the positioning, not the button: `.btn3d` sets
            `position: relative` and is UNLAYERED, so a Tailwind `absolute`
            utility on the button itself silently loses.

            Solid accent pink with a white cross, not the white clay chip that
            was here first — a white chip on the corner of a pale picture was
            reported as hard to see, and pink is already the site's language
            for chrome (the header's own icon chips). */}
        <span className="absolute -right-4 -top-4 sm:-right-5 sm:-top-5">
          <Button3D
            tone={{ face: "var(--accent)", edge: "var(--accent-dark)" }}
            onClick={() => setOpen(false)}
            aria-label="Close and go back to the puzzle"
            className="h-14 w-14 sm:h-16 sm:w-16"
          >
            <X className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={3.25} />
          </Button3D>
        </span>
      </div>
    </div>
  );

  return (
    <>
      <Button3D
        tone={{ face: "var(--brand)", edge: "var(--brand-dark)" }}
        onClick={() => setOpen(true)}
        aria-label="See the finished picture"
        className="h-16 w-16 text-sm font-bold sm:h-20 sm:w-20 sm:text-base"
      >
        View
      </Button3D>

      {open && createPortal(overlay, document.body)}
    </>
  );
}
