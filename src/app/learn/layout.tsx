import type { ReactNode } from "react";
import { LearnSounds } from "@/components/learn/learn-sounds";

/** Learn's pages, with its button sounds (`LearnSounds`). */
export default function LearnLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <LearnSounds />
    </>
  );
}
