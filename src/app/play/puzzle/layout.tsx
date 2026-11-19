import type { ReactNode } from "react";
import { PlayGate } from "@/components/activities/play-gate";

/** The puzzles open for two stars on `/play` (`PlayGate`). */
export default function PuzzleLayout({ children }: { children: ReactNode }) {
  return <PlayGate game="puzzle">{children}</PlayGate>;
}
