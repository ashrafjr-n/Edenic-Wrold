import type { ReactNode } from "react";
import { PlayGate } from "@/components/activities/play-gate";

/** Memory Match opens for two stars on `/play` (`PlayGate`). */
export default function MemoryMatchLayout({ children }: { children: ReactNode }) {
  return <PlayGate game="memory">{children}</PlayGate>;
}
