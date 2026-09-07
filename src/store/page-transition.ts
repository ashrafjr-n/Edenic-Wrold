"use client";

import { create } from "zustand";

/** How long the cover animation (`.page-veil--in` in globals.css) takes to
    fully fill the screen — the trigger waits this long before calling
    `router.push`, so the destination page never flashes in before the veil
    has finished covering it. Keep this in sync with that animation's
    duration by hand; it's two numbers, not worth wiring a shared constant
    through CSS custom properties for. */
export const TRAIL_COVER_MS = 560;

interface PageTransitionState {
  /** True from the moment a cloud-veil navigation starts until the veil has
      fully uncovered the destination page. No `hydrated` flag needed here —
      unlike `theme`/`progress`, nothing is persisted, so server and first
      client render always agree on `false`. */
  active: boolean;
  start: () => void;
  reset: () => void;
}

export const usePageTransition = create<PageTransitionState>((set) => ({
  active: false,
  start: () => set({ active: true }),
  reset: () => set({ active: false }),
}));
