import type { ReactNode } from "react";
import { PlayGate } from "@/components/activities/play-gate";

/** Find opens for two stars on `/play` (`PlayGate`). */
export default function FindLayout({ children }: { children: ReactNode }) {
  return <PlayGate game="find">{children}</PlayGate>;
}
