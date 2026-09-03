"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Lightbulb, SkipForward, X } from "lucide-react";
import type { PuzzlePicture } from "@/types/puzzle";
import { Button3D } from "@/components/ui/button-3d";

interface PuzzleHintProps {
  picture: PuzzlePicture;
  /** How many "Help" presses this stage has left. At zero the button is
      disabled rather than hidden — a child can see that help existed and has
      run out, which a vanished button never says. */
  helpsLeft: number;
  /** Places one piece on the board. Fired on the way out: the overlay closes
      first, so the piece is seen travelling home rather than landing behind
      a scrim. */
  onHelp: () => void;
}

/**
 * The hint chip — a yellow clay circle carrying a black lightbulb, sitting
 * opposite the back button — and what it opens: the finished picture, with
 * "Help" and "Skip" beneath it.
 *
 * It's an overlay rather than an `<iframe>`: the picture is a local asset
 * already on the page, so a frame would only cost a second document and lose
 * the clay framing around it.
 *
 * The overlay is PORTALLED to `document.body`. Rendered in place it sat
 * inside the header's `.anim-drop-in` wrapper, and an element running a CSS
 * animation makes its own stacking context — so `z-50` was measured against
 * its siblings inside that header rather than the page, and the board and
 * tray drew straight over the top of it.
 */
export function PuzzleHint({ picture, helpsLeft, onHelp }: PuzzleHintProps) {
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

  const help = () => {
    if (helpsLeft <= 0) return;
    /* Closed first, then the piece is asked for: the whole point of helping
       is that the child WATCHES a piece go home, and it would otherwise
       travel behind the scrim. */
    setOpen(false);
    onHelp();
  };

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
      /* `--color-ink-fixed`: a dimming scrim has to stay dark to do its
         job regardless of page theme — `--color-ink` alone flips light in
         dark mode, which would turn "dim the background" into the opposite. */
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-ink-fixed)]/70 p-7 sm:p-10"
    >
      <div
        className="card anim-pop-in relative w-full p-3 sm:p-4"
        style={{
          /* An upright picture cannot always take the full 48rem: a square
             one that wide is 48rem tall, and the card would run off the top
             and bottom of the overlay with the middle of the picture the only
             part left to see. Capping the card by the height the viewport
             actually has keeps the whole picture on screen — which is the
             entire point of opening it. The subtracted chrome covers the
             overlay's own padding, the card's, AND the button row under the
             picture; it grew when that row arrived. */
          maxWidth: `min(48rem, (100svh - 12rem) * ${picture.image.width} / ${picture.image.height})`,
        }}
        /* The picture itself is not a way out — only the scrim and the cross
           are. */
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="relative w-full overflow-hidden rounded-2xl"
          style={{
            aspectRatio: `${picture.image.width} / ${picture.image.height}`,
          }}
        >
          <Image
            src={picture.image}
            alt={picture.alt}
            fill
            sizes="(min-width: 768px) 48rem, 100vw"
            className="object-cover"
          />
        </div>

        <div className="mt-3 flex items-center justify-center gap-3 sm:mt-4 sm:gap-4">
          <Button3D
            tone={{ face: "var(--color-go)", edge: "var(--color-go-dark)" }}
            onClick={help}
            disabled={helpsLeft <= 0}
            aria-label={`Help — put one piece in place. ${helpsLeft} left`}
            className="px-5 py-2.5 text-base sm:px-6 sm:py-3 sm:text-lg"
          >
            <Lightbulb className="h-5 w-5 fill-current" strokeWidth={2} />
            Help
            {/* The three presses, counted down where the child is looking
                when they spend one. */}
            <span className="rounded-full bg-white/25 px-2 py-0.5 text-sm font-bold sm:text-base">
              {helpsLeft}
            </span>
          </Button3D>

          {/* Skip is deliberately inert for now — asked for as appearance
              only, with its job still to be decided. Closing is the least
              surprising thing a button in a dialog can do until then. */}
          <Button3D
            variant="calm"
            /* `--color-ink-fixed`: `.btn3d--clay-white`'s face is pinned
               pale in dark mode (globals.css), so its text has to stay
               fixed dark too — `--color-ink` itself flips light there. */
            tone={{ face: "var(--surface)", text: "var(--color-ink-fixed)" }}
            onClick={() => setOpen(false)}
            className="btn3d--clay-white px-5 py-2.5 text-base sm:px-6 sm:py-3 sm:text-lg"
          >
            <SkipForward className="h-5 w-5 fill-current" strokeWidth={2} />
            Skip
          </Button3D>
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
      {/* Yellow with a BLACK bulb, and the same size as the back button it
          now sits opposite — the two read as one row of chrome. Gold is
          already the site's "this is the good bit" colour (the crown, the
          say-it button), and it is the one face on the site dark enough text
          would lose against, which is why the bulb is ink rather than
          white. */}
      <Button3D
        tone={{
          face: "var(--color-gold)",
          edge: "var(--color-gold-dark)",
          /* Gold is unaffected by theme, so its icon has to stay unaffected
             too — `--color-ink` alone flips light in dark mode. */
          text: "var(--color-ink-fixed)",
        }}
        onClick={() => setOpen(true)}
        aria-label="Hints — see the finished picture"
        className="h-12 w-12 shrink-0 sm:h-14 sm:w-14"
      >
        <Lightbulb className="h-6 w-6 fill-current sm:h-7 sm:w-7" strokeWidth={2} />
      </Button3D>

      {open && createPortal(overlay, document.body)}
    </>
  );
}
