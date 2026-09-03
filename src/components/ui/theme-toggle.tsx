"use client";

import { Moon, Sun } from "lucide-react";
import { Button3D } from "@/components/ui/button-3d";
import { useTheme } from "@/store/theme";

/**
 * The header's Moon/Sun chip. Same accent-pink clay chrome the language
 * button wears (`.btn3d--icon-accent` in `globals.css` overrides the
 * `tone`/`variant` below regardless — kept for documentation, same as the
 * language button), and it STAYS that pink face in dark mode too — only the
 * icon inside it changes (Sun instead of Moon, and black instead of white,
 * via the `[data-theme="dark"] header .btn3d` rule in globals.css). It's the
 * only piece of `HeaderChrome` with real behavior: everything else there is
 * still presentation only.
 *
 * Dark mode is site-wide (`ThemeSync` syncs `theme` onto `<html
 * data-theme>`) — toggling this repaints every page, not just the one
 * you're on.
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
      /* Always pink — direct request: the chip's FACE does not change with
         dark mode, only the icon inside it (which goes black via the
         `[data-theme="dark"] header .btn3d` rule in globals.css). An
         earlier version swapped this to a gold face once dark mode turned
         on; reverted, don't reintroduce it. */
      className="btn3d--icon-accent h-11 w-11 shrink-0"
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
