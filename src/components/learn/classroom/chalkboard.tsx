import { ViewTransition, type ReactNode } from "react";

interface ChalkboardProps {
  /** `hub`: the board on Pinki's wall. `course`: up close, filling the
      screen — a course's lessons. */
  size: "hub" | "course";
  className?: string;
  children: ReactNode;
}

/**
 * Pinki's chalkboard (2026-10-14): a slate in a clay wood frame on a chalk
 * tray, drawn by the page — so what is written on it stays sharp in every
 * language. The SAME view transition (`pinki-board`) on the hub and on a
 * course page: tapping a course zooms the board up to fill the screen
 * with its lessons on it, and back.
 */
export function Chalkboard({ size, className = "", children }: ChalkboardProps) {
  return (
    <ViewTransition name="pinki-board" share="board-morph" default="none">
      <div className={`chalkboard chalkboard--${size} ${className}`}>
        <div className="chalkboard-slate">{children}</div>
        <span className="chalkboard-tray" aria-hidden>
          <span />
          <span />
          <span />
        </span>
      </div>
    </ViewTransition>
  );
}
