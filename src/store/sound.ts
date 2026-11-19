"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SoundState {
  /** Every Learn sound off: the words, the effects and the reels' sound. */
  muted: boolean;
  /** False until `persist` has read localStorage — readers show "on" until
      then, same rule as `store/theme.ts`. */
  hydrated: boolean;
  setHydrated: () => void;
  toggleMuted: () => void;
}

export const useSound = create<SoundState>()(
  persist(
    (set) => ({
      muted: false,
      hydrated: false,
      setHydrated: () => set({ hydrated: true }),
      toggleMuted: () => set((state) => ({ muted: !state.muted })),
    }),
    {
      name: "edenic-sound",
      partialize: (state) => ({ muted: state.muted }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);
