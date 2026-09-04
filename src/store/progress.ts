"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ItemKey } from "@/lib/progress-keys";

/* The key builders are pure, and they live in `lib/progress-keys.ts` rather
   than here so a SERVER component can call them — anything exported from a
   `"use client"` module can only be invoked from client code. Re-exported
   from this file so every existing `@/store/progress` import still works. */
export type { ItemKey } from "@/lib/progress-keys";
export { itemKey, puzzleKey, memoryKey } from "@/lib/progress-keys";

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
      /* Fires with the rehydrated state on success. It is deliberately still
         guarded: on FAILURE zustand calls this with `undefined`, and setting
         from here in that case is not merely useless but harmful — see the
         block under this store for what happens instead. */
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);

/* **The failure path cannot flip `hydrated` from inside `create()`, so it is
   flipped here.**

   Rehydration fails on more than a disabled storage: `createJSONStorage`
   short-circuits on `null` ALONE, so any other unparseable value reaches
   `JSON.parse` and throws — a corrupted entry, and an empty string too.
   Zustand catches that and calls `onRehydrateStorage`'s inner callback with
   `undefined`, which is why the guard above can never handle it.

   Removing the guard does not work either, and this is the part worth
   keeping: `persist` runs `hydrate()` synchronously DURING `create()`, before
   zustand has assigned the store's state, so `get()` is still `undefined`
   there. On the success path that is harmless — `set(stateFromStorage, true)`
   has populated the state before the callback runs. On the failure path that
   `set` never happens, so calling `setHydrated()` from the callback does
   `Object.assign({}, undefined, { hydrated: true })` — it WIPES `items` and
   every action, persists that wreckage as `{"state":{}}`, and is then thrown
   away wholesale when `create()` returns `configResult`. Measured, not
   reasoned about: the flag stayed false, the stored value was corrupted a
   second time, and no error surfaced anywhere because zustand's own
   `toThenable` swallows throws on this path.

   Running it out here, once the store genuinely exists, avoids all of that —
   and the resulting write repairs the unreadable value instead of adding to
   it. Safe to test synchronously because `localStorage` is synchronous, so
   `hydrate()` has always finished by this line; an async storage would need
   `onFinishHydration` instead. */
if (typeof window !== "undefined" && !useProgress.getState().hydrated) {
  useProgress.getState().setHydrated();
}
