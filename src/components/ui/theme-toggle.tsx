"use client";

import { Moon, Sun } from "lucide-react";
import { Button3D } from "@/components/ui/button-3d";
import { useTheme } from "@/store/theme";

/**
 * The header's Moon/Sun chip. Same accent-pink clay chrome the language
 * button wears (`.btn3d--icon-accent` in `globals.css` overrides the
 * `tone`/`variant` below regardless — kept for documentation, same as the
 * language button). It's the only piece of `HeaderChrome` with real
 * behavior: everything else there is still presentation only.
 *
 * The toggle itself is global — it renders on every page, since the header
 * is shared chrome — but flipping it only repaints `/` and `/activities`
 * (see `DarkScope`). Visiting any other page while it's "on" changes
 * nothing there; the icon and the persisted preference are the only things
 * that travel with you.
 */
export function ThemeToggle() {
  const theme = useTheme((state) => state.theme);
  const hydrated = useTheme((state) => state.hydrated);
  const toggleTheme = useTheme((state) => state.toggleTheme);
  /* Server HTML always has `theme: "light"` (the store's un-hydrated
     default) — rendering the live `theme` before `hydrated` flips would
     disagree with that first paint and throw a hydration error, same rule
     `store/progress.ts` documents for its own `hydrated` flag. */
  const isDark = hydrated && theme === "dark";

  return (
    <Button3D
      tone={{ face: "var(--accent)", edge: "var(--accent-dark)", text: "#fff" }}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      /* Gold once dark mode is ON, pink otherwise — tied to the toggle's own
         state (see `.btn3d--icon-gold` in globals.css), not to page scope,
         so the chip reads gold on every page the instant dark mode is on. */
      className={`${isDark ? "btn3d--icon-gold" : "btn3d--icon-accent"} h-11 w-11 shrink-0`}
      onClick={toggleTheme}
    >
      {isDark ? (
        <Sun className="h-5 w-5" strokeWidth={2.25} />
      ) : (
        <Moon className="h-5 w-5" strokeWidth={2.25} />
      )}
    </Button3D>
  );
}
