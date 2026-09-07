"use client";

import { create } from "zustand";

/** How long the trigger waits before calling `router.push`, so the
    destination never flashes in before the cloud drift has covered the
    screen. Deliberately a little SHORTER than the drift's own worst case
    (`.page-veil--in`'s 700ms plus the longest per-bank stagger in
    `PageTransitionOverlay`): the route swap only has to be hidden, and the
    overlay waits for the pathname to actually change before it starts
    clearing, so an early push costs nothing and a late one just makes the
    whole transition feel slow. Hand-synced with those two — it's a handful
    of numbers, not worth threading a shared constant through CSS. */
export const TRAIL_COVER_MS = 700;

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
