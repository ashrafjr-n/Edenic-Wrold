"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Scroll this far (px) from the top before the back button may hide, and
    how much a scroll has to move before it counts (ignores jitter). */
const TOP = 80;
const STEP = 6;

/**
 * Hides every back button (`.back-spot`) while the page is scrolled DOWN and
 * brings it back on the first scroll UP — and always at the top and on
 * arriving at a page. It only flips `data-back-hidden` on `<html>`; the
 * motion is CSS (`globals.css`). Mounted once, in the root layout.
 */
export function BackAutoHide() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    let last = window.scrollY;
    root.removeAttribute("data-back-hidden");

    const onScroll = () => {
      const y = window.scrollY;
      if (y < TOP) root.removeAttribute("data-back-hidden");
      else if (y > last + STEP) root.setAttribute("data-back-hidden", "");
      else if (y < last - STEP) root.removeAttribute("data-back-hidden");
      if (Math.abs(y - last) > STEP) last = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      root.removeAttribute("data-back-hidden");
    };
  }, [pathname]);

  return null;
}
