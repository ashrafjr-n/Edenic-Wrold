import { ViewTransition, type CSSProperties, type ReactNode } from "react";
import chalkFrame from "../../../../public/assets/learn/pinki/classroom/chalk-frame.png";
import chalkFrameDashed from "../../../../public/assets/learn/pinki/classroom/chalk-frame-dashed.png";
import chalkGrain from "../../../../public/assets/learn/pinki/classroom/chalk-grain.png";
import chalkSmudge from "../../../../public/assets/learn/pinki/classroom/chalk-smudge.png";

/* The chalk (`tools/picnic-scene/chalk.py`) — the boxes drawn on the board,
   the grain over what is written on it, the eraser's smudges — handed
   down as custom properties, so the stylesheet reads the hashed
   (cache-busted) files. */
const CHALK = {
  "--chalk-frame": `url(${chalkFrame.src})`,
  "--chalk-frame-dashed": `url(${chalkFrameDashed.src})`,
  "--chalk-grain": `url(${chalkGrain.src})`,
  "--chalk-smudge": `url(${chalkSmudge.src})`,
} as CSSProperties;

interface ChalkboardProps {
  /** `hub`: the board on Pinki's wall. `course`: up close, filling the
      screen — a course's lessons. `lesson`: a small board inside one of her
      lessons (the word, the done screen). `strip`: a slim one, no tray —
      the desktop lesson's steps. */
  size: "hub" | "course" | "lesson" | "strip";
  className?: string;
  children: ReactNode;
}

/**
 * Pinki's chalkboard (2026-10-14): a slate, wiped but never quite clean, in
 * a clay wood frame on a tray of chalk and an eraser, drawn by the page — so what is written on it stays sharp in every
 * language. The SAME view transition (`pinki-board`) on the hub and on a
 * course page: tapping a course zooms the board up to fill the screen
 * with its lessons on it, and back. A lesson's boards are her chalk too,
 * but not that board: they never take part in its zoom.
 */
export function Chalkboard({ size, className = "", children }: ChalkboardProps) {
  const board = (
    <div className={`chalkboard chalkboard--${size} ${className}`} style={CHALK}>
      <div className="chalkboard-slate">{children}</div>
      {size !== "strip" && (
        <span className="chalkboard-tray" aria-hidden>
          <span />
          <span />
          <span />
          <span className="chalkboard-eraser" />
        </span>
      )}
    </div>
  );
  if (size === "lesson" || size === "strip") return board;
  return (
    <ViewTransition name="pinki-board" share="board-morph" default="none">
      {board}
    </ViewTransition>
  );
}
