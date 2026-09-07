"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { Cloud, type CloudTint, type CloudVariant } from "@/components/ui/cloud";
import { usePageTransition } from "@/store/page-transition";

/** How long the drift holds packed once the destination page has actually
    arrived, before it starts clearing — a floor under a fast (prefetched)
    navigation so the cover never reads as a flicker. Long enough, too, that
    the last-delayed cloud has finished rising before the exit begins. */
const HOLD_MS = 300;
/** `.page-veil--out`'s own duration plus the longest exit stagger below. */
const REVEAL_MS = 1040;

interface VeilCloud {
  top: string;
  left: string;
  /** Inline `--cloud-w`, in `vmax` — see the CSS block's note on why the
      `sm/md/lg` rem sizes can't pack both a phone and a desktop. */
  width: string;
  variant: CloudVariant;
  tint: CloudTint;
  delay: string;
}

/** Six rows, top to bottom, starting above the screen and ending below it.
    22% apart against a cloud that is ~34% of the viewport tall at these
    widths, so each row's flat base is buried under the row beneath it. */
const ROWS = [-12, 10, 32, 54, 76, 98];
/** Four per row at 33% spacing against a ~62% viewport-wide cloud, which
    leaves neighbours overlapping by about half. **That overlap is the whole
    fix** and it is worth stating why: two clouds side by side meet in a V,
    and a shallow V (heavy overlap) is covered by the dome of the row below,
    while a deep one (the first version, 44% apart) cuts past that dome's
    shoulder and shows a sliver of the PAGE through the drift. Every gap the
    first layout left was one of those notches, never a row seam. */
const COLUMNS = [-8, 25, 58, 91];
/** Every other row is nudged half a column across, so a row's notches sit
    over the middle of a cloud below rather than lining up into a channel
    running down the screen. */
const ROW_SHIFT = 16;
/** Cycled per cloud on lengths that share no factor with the row/column
    counts, so size, silhouette and tint drift against each other instead of
    repeating down a column — the same trick `trailStops` uses. */
const WIDTHS = [70, 62, 74, 66];
const VARIANTS: CloudVariant[] = [1, 2, 3];
const TINTS: CloudTint[] = ["white", "white", "sky", "white", "lavender", "white", "pink"];

/**
 * The drift, derived rather than hand-placed — a fixed table either way (a
 * random one would land differently every run and could never be tuned),
 * but derived means a row or column can be added without re-typing
 * twenty-four coordinates.
 *
 * **Delays run bottom-up.** Clouds are travelling upward, so the ones
 * lowest on screen set off first; a top-down stagger reads as the drift
 * sinking while it rises.
 */
function veilClouds(): VeilCloud[] {
  return ROWS.flatMap((top, row) =>
    COLUMNS.map((left, column) => {
      const index = row * COLUMNS.length + column;
      return {
        top: `${top}%`,
        left: `${left + (row % 2 ? ROW_SHIFT : 0)}%`,
        width: `${WIDTHS[index % WIDTHS.length]}vmax`,
        variant: VARIANTS[index % VARIANTS.length],
        tint: TINTS[index % TINTS.length],
        delay: `${(ROWS.length - 1 - row) * 45 + column * 25}ms`,
      };
    }),
  );
}

const VEIL_CLOUDS = veilClouds();

/**
 * A drift of clay clouds that rises from below the viewport, packs the
 * screen, then carries on up and off the top — the transition `TrailCta`
 * plays on the way into `/trail`.
 *
 * **Clouds only: no panel, no gradient, no starfield behind them**, and it
 * passes UNDER the header and bottom nav rather than over them (`z-10`
 * against their `z-20`). Both were the other way round for one round and
 * both were rejected — see the `.page-veil` block in `globals.css`.
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
      {VEIL_CLOUDS.map((cloud, index) => (
        <Cloud
          key={index}
          variant={cloud.variant}
          tint={cloud.tint}
          className="page-veil-cloud absolute"
          style={
            {
              top: cloud.top,
              left: cloud.left,
              "--cloud-w": cloud.width,
              animationDelay: cloud.delay,
            } as CSSProperties
          }
        />
      ))}
    </div>,
    document.body,
  );
}
