"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { Cloud, type CloudTint } from "@/components/ui/cloud";
import { usePageTransition } from "@/store/page-transition";

/** How long the drift holds packed once the destination page has actually
    arrived, before it starts clearing — a floor under a fast (prefetched)
    navigation so the cover never reads as a flicker. Long enough, too, that
    the last-delayed bank has finished rising before the exit begins. */
const HOLD_MS = 260;
/** `.page-veil--out`'s own duration plus the longest exit stagger below. */
const REVEAL_MS = 940;

interface VeilBank {
  top: string;
  height: string;
  tint: CloudTint;
  delay: string;
}

/**
 * Three wide banks, and the two numbers everything else falls out of.
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

/** Top to bottom, and the tints read as depth: the nearest bank (lowest on
    screen, drawn last) is plain white, the ones behind it take a breath of
    the sky's own blue and lavender. Delays run BOTTOM-UP — the banks travel
    upward, so the lowest sets off first; staggering the other way reads as
    the drift sinking while it rises. */
const BANKS: VeilBank[] = [
  { top: `${-0.41 * BANK_H}vh`, height: `${BANK_H}vh`, tint: "lavender", delay: "170ms" },
  { top: `${-0.41 * BANK_H + BANK_STEP}vh`, height: `${BANK_H}vh`, tint: "sky", delay: "85ms" },
  { top: `${-0.41 * BANK_H + BANK_STEP * 2}vh`, height: `${BANK_H}vh`, tint: "white", delay: "0ms" },
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
          tint={bank.tint}
          className="page-veil-cloud cloud--stretch absolute left-1/2"
          style={
            {
              top: bank.top,
              height: bank.height,
              "--cloud-w": "150vw",
              animationDelay: bank.delay,
            } as CSSProperties
          }
        />
      ))}
    </div>,
    document.body,
  );
}
