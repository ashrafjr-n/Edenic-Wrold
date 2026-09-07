"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { Cloud } from "@/components/ui/cloud";
import { usePageTransition } from "@/store/page-transition";

/** How long the veil holds fully covered once the destination page has
    actually arrived, before it starts uncovering — a floor under a fast
    (cached/prefetched) navigation so the cover never reads as a flicker. */
const HOLD_MS = 260;
/** Matches `.page-veil--out`'s animation-duration in globals.css. */
const REVEAL_MS = 650;

/** Where the decorative clouds sit inside the veil, as a percentage of the
    full-screen panel — spread down the whole height so the slide always has
    a few crossing the viewport, whichever moment it's judged at. Fixed, not
    randomised: this can render while the previous page's tree is still
    around, so a random layout risks the same hydration mismatch the trail's
    own stops avoid by being a fixed table. */
const VEIL_CLOUDS = [
  { top: "10%", left: "18%", size: "lg", variant: 1, tint: "white" },
  { top: "30%", left: "70%", size: "md", variant: 2, tint: "sky" },
  { top: "52%", left: "28%", size: "lg", variant: 3, tint: "white" },
  { top: "72%", left: "66%", size: "md", variant: 1, tint: "white" },
  { top: "88%", left: "42%", size: "sm", variant: 2, tint: "sky" },
] as const;

/**
 * A full-screen wall of clay clouds that rises from the bottom to cover the
 * page on the way to `/trail`, then continues rising off the top to reveal
 * it — the "flying through the sky" transition `TrailCta` triggers.
 *
 * **Lives once in the root layout, not per-page.** The root layout doesn't
 * remount across a client navigation, so this component's own state (and
 * the CSS animation riding on it) survives the `router.push` untouched —
 * that's what lets the veil stay covering the screen while the new route's
 * RSC payload streams in behind it, instead of a fresh overlay per page.
 *
 * **State comes from `usePageTransition`, not local state alone**, because
 * the trigger (`TrailCta`) and this overlay are nowhere near each other in
 * the tree — the same reason `theme`/`progress` are zustand stores rather
 * than props.
 *
 * **`revealing` only flips once `pathname` has actually moved away from
 * where the transition STARTED**, not just once it differs from whatever
 * pathname happened to be current at mount — `startPathRef` is captured the
 * instant `active` turns true (a ref, not state: writing it costs no
 * render) precisely so an already-elsewhere pathname at mount can never be
 * mistaken for "navigation just completed" the moment a transition begins.
 * Getting this wrong would reveal the OLD page while it's still covered,
 * before the new one has even started loading.
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
      className={`page-veil trail-sky--day ${revealing ? "page-veil--out" : "page-veil--in"}`}
    >
      {VEIL_CLOUDS.map((cloud, index) => (
        <Cloud
          key={index}
          size={cloud.size}
          variant={cloud.variant}
          tint={cloud.tint}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ top: cloud.top, left: cloud.left }}
        />
      ))}
    </div>,
    document.body,
  );
}
