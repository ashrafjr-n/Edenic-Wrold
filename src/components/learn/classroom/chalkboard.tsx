import { ViewTransition, type CSSProperties, type ReactNode } from "react";
import chalkFrame from "../../../../public/assets/learn/classroom/chalk-frame.png";
import chalkFrameDashed from "../../../../public/assets/learn/classroom/chalk-frame-dashed.png";
import chalkGrain from "../../../../public/assets/learn/classroom/chalk-grain.png";
import chalkSmudge from "../../../../public/assets/learn/classroom/chalk-smudge.png";

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
  className?: string;
  children: ReactNode;
}

/**
 * Pinki's chalkboard (2026-10-14): a slate, wiped but never quite clean, in
 * a clay wood frame on a tray of chalk and an eraser, drawn by the page — so what is written on it stays sharp in every
 * language — the board on the friend's classroom wall (`ClassroomShell`).
 */
export function Chalkboard({ className = "", children }: ChalkboardProps) {
  const board = (
    <div className={`chalkboard chalkboard--hub ${className}`} style={CHALK}>
      <div className="chalkboard-slate">{children}</div>
      <span className="chalkboard-tray" aria-hidden>
        <span />
        <span />
        <span />
        <span className="chalkboard-eraser" />
      </span>
    </div>
  );
  return (
    <ViewTransition name="class-board" share="board-morph" update="board-morph" default="none">
      {board}
    </ViewTransition>
  );
}
