"use client";

import { useSyncExternalStore } from "react";

/* A wide screen (a desktop's, a tablet's on its side) shows a picture's
   landscape frame; a phone's or an upright tablet's, the portrait one —
   the same test as the CSS `landscape:` variant. */
const WIDE = "(orientation: landscape)";

const watch = (change: () => void) => {
  const query = window.matchMedia(WIDE);
  query.addEventListener("change", change);
  return () => query.removeEventListener("change", change);
};

/** Whether the screen is wider than tall, kept up to date as it turns.
    The server (and the first paint) answers portrait. */
export function useWide(): boolean {
  return useSyncExternalStore(watch, () => window.matchMedia(WIDE).matches, () => false);
}
