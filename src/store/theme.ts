"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  /** False until `persist` has read localStorage. Every reader must treat the
      theme as "light" until this flips, or the server HTML and the first
      client render disagree and React throws a hydration error — same rule
      `store/progress.ts` follows for `hydrated`. */
  hydrated: boolean;
  setHydrated: () => void;
  toggleTheme: () => void;
}

export const useTheme = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "light",
      hydrated: false,
      setHydrated: () => set({ hydrated: true }),
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" })),
    }),
    {
      name: "edenic-theme",
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);
