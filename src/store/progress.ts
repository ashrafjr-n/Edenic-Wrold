"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/** `pinki.numbers.1` — the shape CLAUDE.md describes (character → lesson →
    item), flattened to one key so the store stays a single flat map instead of
    three nested records to merge on every write. */
export type ItemKey = string;

export function itemKey(
  characterId: string,
  lessonId: string,
  item: number | string,
): ItemKey {
  return `${characterId}.${lessonId}.${item}`;
}

interface ItemProgress {
  /** 1–3, scored across the whole journey, not per stage. */
  stars: number;
  completedAt: number;
}

interface ProgressState {
  items: Record<ItemKey, ItemProgress>;
  /** False until `persist` has read localStorage. Every reader must render the
      nothing-finished-yet view until this flips, or the server HTML and the
      first client render disagree and React throws a hydration error. */
  hydrated: boolean;
  setHydrated: () => void;
  complete: (key: ItemKey, stars: number) => void;
  reset: () => void;
}

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      items: {},
      hydrated: false,
      setHydrated: () => set({ hydrated: true }),
      complete: (key, stars) =>
        set((state) => {
          const existing = state.items[key];
          /* Best score wins: replaying a number the child has already finished
             must never take stars away from them. */
          if (existing && existing.stars >= stars) return state;

          return {
            items: { ...state.items, [key]: { stars, completedAt: Date.now() } },
          };
        }),
      reset: () => set({ items: {} }),
    }),
    {
      name: "edenic-progress",
      storage: createJSONStorage(() => localStorage),
      /* `hydrated` is derived, never stored — persisting it would make a fresh
         load start out claiming it had already read storage. */
      partialize: (state) => ({ items: state.items }),
      /* Fires after rehydration, and also when it fails (private mode, storage
         disabled). Either way the UI has to stop waiting, so this sets the flag
         unconditionally rather than only on success. */
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);
