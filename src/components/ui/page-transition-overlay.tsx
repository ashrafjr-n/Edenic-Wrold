"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { Cloud } from "@/components/ui/cloud";
import { usePageTransition } from "@/store/page-transition";

/** How long the drift holds packed once the destination page has actually
    arrived, before it starts clearing — a floor under a fast (prefetched)
    navigation so the cover never reads as a flicker. Long enough, too, that
    the last-delayed bank has finished rising before the exit begins. */
const HOLD_MS = 220;
/** `.page-veil--out`'s own duration plus the longest exit stagger below. */
const REVEAL_MS = 860;

interface VeilBank {
  top: string;
  height: string;
  /** Which of the three whites — `.page-veil-cloud--far|mid|near`. */
  shade: "far" | "mid" | "near";
  delay: string;
}

/**
 * Three wide banks, and the two numbers everything else falls out of.
 *
 * **Every unit here is `lvh` — the LARGE viewport, deliberately.** This is
 * a veil that has to cover the screen with no gap, so it wants the biggest
 * the viewport can ever be; sized in `dvh` it would shrink to the currently
 * visible height and re-measure mid-flight as the phone's chrome slides,
 * which is exactly where a seam of page would show through. That is the
 * opposite call from a LAYOUT box (`NumberVideo`, `.puzzle-upright`), which
 * takes `svh` so it never overflows. `lvh` rather than plain `vh` only so
 * the intent is stated: the two are the same height, but only one of them
 * says which viewport it meant.
 *
 * `BANK_H` is each bank's height as a share of the viewport; `BANK_STEP` is
 * how far apart they sit. **A bank is only opaque from about 40% of its own
 * height down** (above that you are among the lobes, where the silhouette
 * is still forming), so a step of half a bank's height is what puts one
 * bank's solid middle under the next one's lobe valleys. Stepping them any
 * further apart is exactly how the earlier, puffier drift leaked slivers of
 * the page.
 *
 * The stack starts well above the screen (`-0.41 * BANK_H`, so the topmost
 * bank's solid part begins just off the top edge) and the three together
 * reach past the bottom of the viewport — checked by freezing the drift at
 * its packed position and screenshotting, not by eye.
 */
const BANK_H = 68;
const BANK_STEP = 35;
/**
 * How wide each bank is drawn — **in `vh`, tracking its own forced height,
 * with a `vw` floor.** The height has to be a share of the VIEWPORT (three
 * banks have to cover it), so a width in `vw` leaves the shape's aspect
 * ratio at the mercy of the screen's: on a 390x844 phone a `150vw` bank came
 * out three and a half times taller than the silhouette is drawn for, and
 * its lobes stretched into tall fingers — the opposite of the long, flat
 * cloud this variant exists to be. Sized off `vh` it holds roughly the same
 * proportions everywhere. The `vw` floor is what keeps it spanning a short,
 * wide desktop, where `vh` alone would leave it narrower than the screen. */
const BANK_W = `max(${(BANK_H * 2.4).toFixed(0)}lvh, 115vw)`;

/** Top to bottom — and they arrive IN THAT ORDER, one after the other, on
    direct request: the bank that ends up highest sets off first and the
    other two follow it up the screen. (It ran bottom-up for a round, which
    is the physically obvious reading — the nearest cloud passing first —
    but a queue is easier to follow than a wave, and this is a queue.)
    `SHADE` is each one's own class: pale white behind, plain white, then
    pure white in front, so the three read as depth rather than as one white
    mass now that they carry no drop shadow to separate them. */
const BANKS: VeilBank[] = [
  { top: `${-0.41 * BANK_H}lvh`, height: `${BANK_H}lvh`, shade: "far", delay: "0ms" },
  { top: `${-0.41 * BANK_H + BANK_STEP}lvh`, height: `${BANK_H}lvh`, shade: "mid", delay: "110ms" },
  { top: `${-0.41 * BANK_H + BANK_STEP * 2}lvh`, height: `${BANK_H}lvh`, shade: "near", delay: "220ms" },
];

/**
 * Three wide banks of clay cloud that rise from below the viewport, cover
 * the screen, then carry on up and off the top — the transition `TrailCta`
 * plays on the way into `/trail`.
 *
 * **Three elements, not the two dozen puffs this started as.** Banks span
 * more than the full width, so the drift has no vertical seams to leak the
 * page through, and it costs an eighth of the compositing — the puffy
 * version was reported as heavy, and it was. See the `.page-veil` block in
 * `globals.css` for the rest of that history.
 *
 * **Clouds only: no panel, no gradient, no starfield behind them**, and it
 * passes UNDER the header and bottom nav rather than over them (`z-10`
 * against their `z-20`). Both were the other way round for one round and
 * both were rejected.
 *
 * **Lives once in the root layout, not per-page.** The root layout doesn't
 * remount across a client navigation, so this component's own state (and
 * the animations riding on it) survive the `router.push` untouched — that's
 * what keeps the drift on screen while the destination's RSC payload
 * streams in behind it, instead of a fresh overlay per page.
 *
 * **State comes from `usePageTransition`, not local state alone**, because
 * the trigger (`TrailCta`) and this overlay are nowhere near each other in
 * the tree — the same reason `theme`/`progress` are zustand stores.
 *
 * **`revealing` only flips once `pathname` has actually moved away from
 * where the transition STARTED**, not merely once it differs from whatever
 * pathname happened to be current at mount — `startPathRef` is captured the
 * instant `active` turns true (a ref, not state: writing it costs no
 * render). Getting that wrong clears the drift off the OLD page, before the
 * new one has even begun loading.
 */
export function PageTransitionOverlay() {
  const active = usePageTransition((state) => state.active);
  const reset = usePageTransition((state) => state.reset);
  const pathname = usePathname();
  const [revealing, setRevealing] = useState(false);

  const startPathRef = useRef(pathname);
  const wasActiveRef = useRef(active);

  useEffect(() => {
    if (active && !wasActiveRef.current) startPathRef.current = pathname;
    wasActiveRef.current = active;
  }, [active, pathname]);

  useEffect(() => {
    if (!active || revealing || pathname === startPathRef.current) return;
    const timer = window.setTimeout(() => setRevealing(true), HOLD_MS);
    return () => window.clearTimeout(timer);
  }, [active, revealing, pathname]);

  useEffect(() => {
    if (!revealing) return;
    const timer = window.setTimeout(() => {
      setRevealing(false);
      reset();
    }, REVEAL_MS);
    return () => window.clearTimeout(timer);
  }, [revealing, reset]);

  if (!active) return null;

  return createPortal(
    <div
      aria-hidden
      className={`page-veil ${revealing ? "page-veil--out" : "page-veil--in"}`}
    >
      {BANKS.map((bank, index) => (
        <Cloud
          key={index}
          /* The wide bank, stretched to an explicit height — `.cloud--stretch`
             drops its own 40:11 ratio so `height` applies. Wider than the
             screen on purpose: the shape's thin tapered ends stay off it, and
             only its solid middle is ever in frame. */
          variant={4}
          className={`page-veil-cloud page-veil-cloud--${bank.shade} cloud--stretch absolute left-1/2`}
          style={
            {
              top: bank.top,
              height: bank.height,
              "--cloud-w": BANK_W,
              animationDelay: bank.delay,
            } as CSSProperties
          }
        />
      ))}
    </div>,
    document.body,
  );
}
