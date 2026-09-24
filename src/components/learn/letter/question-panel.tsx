import type { CSSProperties, ReactNode } from "react";
import { CueButton } from "./cue-button";

interface QuestionPanelProps {
  /** What the question is played from — see `cueFor`. */
  cue: string;
  cueLabel: string;
  /** What the question is ABOUT, shown on a white clay face (a letter);
      nothing when showing it would give the answer away. */
  children?: ReactNode;
}

/**
 * The top of every question: a pink clay panel with a "?" and the sound to
 * answer from. It is what tells a child "now it's your turn to choose" apart
 * from the meet screen, which SHOWS the same pictures to look at and hear.
 * Answers sit under it as white clay cards.
 */
export function QuestionPanel({ cue, cueLabel, children }: QuestionPanelProps) {
  return (
    <div
      className="clay flex items-center gap-3 rounded-[1.75rem] px-4 py-3 sm:gap-4 sm:px-5"
      style={
        {
          backgroundColor: "var(--page-accent-color)",
          "--clay-edge": "var(--page-accent-edge)",
        } as CSSProperties
      }
    >
      {children && (
        <span className="card card-clay-white card-pill flex h-16 w-16 items-center justify-center sm:h-20 sm:w-20">
          {children}
        </span>
      )}
      <span aria-hidden className="text-5xl font-bold leading-none text-white sm:text-6xl">
        ?
      </span>
      <CueButton cue={cue} label={cueLabel} invite />
    </div>
  );
}
