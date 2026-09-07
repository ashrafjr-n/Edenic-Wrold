"use client";

import { useEffect } from "react";

/**
 * Freezes the page while a full-screen activity owns the screen.
 *
 * Three places need it and they all need the same thing: a stage the child
 * DRAWS or DRAGS on, or a character standing over the whole viewport, where
 * a stray flick that scrolls the page under them reads as the page slipping
 * rather than as scrolling — the trail while Nova is on it, the numbers
 * lesson's tracing stage, and one puzzle stage.
 *
 * `touch-action: none` on the draggable elements themselves (the trace SVG,
 * the puzzle pieces) is a DIFFERENT thing and stays: that stops a drag ON a
 * control from scrolling. This stops the page scrolling at all.
 *
 * Set on `documentElement` as well as `body` because iOS Safari will still
 * scroll a `body`-only lock. The previous inline values are restored rather
 * than cleared, so a page that set its own overflow keeps it.
 */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const root = document.documentElement;
    const previous = [root.style.overflow, document.body.style.overflow];
    root.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous[0];
      document.body.style.overflow = previous[1];
    };
  }, [active]);
}
