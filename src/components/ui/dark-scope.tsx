"use client";

import type { ReactNode } from "react";
import { useTheme } from "@/store/theme";

/**
 * Scopes the dark-mode token overrides in `globals.css` to whichever page
 * renders this — currently only `/` and `/activities`, both by direct
 * request as a first trial. `[data-theme="dark"]` in `globals.css` is what
 * actually repaints anything, and it only matches DESCENDANTS of an element
 * carrying that attribute — so a page that never renders `DarkScope` cannot
 * be touched by this feature no matter what the header's toggle is set to.
 *
 * `className="contents"` (`display: contents`) is what lets this wrap a
 * page's content with zero layout effect: the div never becomes a box, so
 * it can't disturb the flex/grid structure of whatever it wraps, but CSS
 * custom properties still cascade through it to every descendant — which is
 * all a `data-theme` attribute selector needs.
 *
 * Renders `data-theme="light"` until the theme store has hydrated (matching
 * `store/progress.ts`'s own hydration rule) so the server render and the
 * first client render always agree.
 */
export function DarkScope({ children }: { children: ReactNode }) {
  const theme = useTheme((state) => state.theme);
  const hydrated = useTheme((state) => state.hydrated);

  return (
    <div data-theme={hydrated ? theme : "light"} className="contents">
      {children}
    </div>
  );
}
