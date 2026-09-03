"use client";

import { useEffect } from "react";
import { useTheme } from "@/store/theme";

/**
 * Site-wide now — this replaced `DarkScope`, the earlier version that
 * wrapped just Home and Activities in a `display:contents` div carrying
 * `data-theme`. The whole app is in scope now, so the attribute belongs on
 * `<html>` itself rather than on a per-page wrapper: `[data-theme="dark"]`
 * in `globals.css` then cascades to literally every element on every page,
 * `<Header>`/`<BottomNav>` included.
 *
 * This component renders nothing — it's a pure `useEffect` syncing
 * `store/theme.ts`'s `theme` onto `document.documentElement`, a legitimate
 * "synchronize with something outside React" effect (`nextjs-principles.md`
 * §6), not a workaround. The FIRST paint's correct attribute comes from the
 * inline `beforeInteractive` script in `layout.tsx` instead (reads
 * `localStorage` synchronously before any hydration), which is what avoids
 * a flash of the wrong theme; this effect is what keeps `<html>` in sync
 * with the store on every toggle after that.
 */
export function ThemeSync() {
  const theme = useTheme((state) => state.theme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return null;
}
