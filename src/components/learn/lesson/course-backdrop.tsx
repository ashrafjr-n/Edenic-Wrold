import type { CSSProperties } from "react";
import type { Backdrop } from "@/data/backdrops";

/**
 * The course's world behind a lesson: fixed to the screen, under every
 * step, the frame that fits the screen's orientation (CSS picks it, so only
 * that one downloads), washed toward the page ground so it stays quiet —
 * `.course-backdrop` in globals.css. Inside an `isolate` parent: its
 * `-z-10` stays above the body's ground.
 */
export function CourseBackdrop({ backdrop }: { backdrop: Backdrop }) {
  return (
    <div
      aria-hidden
      className="course-backdrop pointer-events-none fixed inset-x-0 top-0 -z-10 h-lvh"
      style={{ "--backdrop-portrait": `url(${backdrop.portrait.src})`, "--backdrop-landscape": `url(${backdrop.landscape.src})` } as CSSProperties}
    />
  );
}
