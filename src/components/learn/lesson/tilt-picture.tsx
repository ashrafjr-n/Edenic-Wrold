"use client";

import type { PointerEvent, ReactNode } from "react";

const lean = (e: PointerEvent<HTMLSpanElement>) => {
  const box = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--tilt-x", String((e.clientX - box.left) / box.width - 0.5));
  e.currentTarget.style.setProperty("--tilt-y", String((e.clientY - box.top) / box.height - 0.5));
};

const rest = (e: PointerEvent<HTMLSpanElement>) => {
  e.currentTarget.style.setProperty("--tilt-x", "0");
  e.currentTarget.style.setProperty("--tilt-y", "0");
};

/**
 * The videos' own animal, cut out of its still, leans toward the finger or
 * the pointer — a picture that reads as round, the 3D animal it stands in
 * for (direct request 2026-10-13). Fills its positioned parent; the lean is
 * CSS (`.tilt`), off under reduced motion.
 */
export function TiltPicture({ children }: { children: ReactNode }) {
  return (
    <span className="tilt absolute inset-0" onPointerMove={lean} onPointerLeave={rest} onPointerUp={rest} onPointerCancel={rest}>
      <span className="tilt-body absolute inset-0">{children}</span>
    </span>
  );
}
