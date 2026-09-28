import type { CSSProperties } from "react";
import type { ShapeId } from "@/types/course";
import { CueButton } from "./cue-button";
import { ClayWord } from "./clay-word";
import { FaceView } from "./face";

interface WordCardProps {
  word: string;
  /** The shape the word names, drawn above it — word and shape together. */
  shape?: ShapeId;
  /** The word's own clip — `lessonCue.word`. */
  cue: string;
  /** Names the speaker for a screen reader ("Hear circle"). */
  label: string;
}

/**
 * Meet the word: one big gold speaker (the word's clip, once audio lands),
 * the shape itself, and the English word under it in clay letters — so the
 * word is learned as the name OF something, not as letters on their own.
 * Nothing to get right here; the lesson's Next is the way on.
 */
export function WordCard({ word, shape, cue, label }: WordCardProps) {
  return (
    <div className="card card-clay-white flex w-full max-w-xl flex-col items-center gap-4 px-6 py-6 sm:gap-7 sm:py-10 [@media(max-height:700px)]:gap-2 [@media(max-height:700px)]:py-2.5">
      <CueButton cue={cue} label={label} size="xl" invite />
      {shape && (
        <span
          className="tile anim-pop-in flex h-[min(8rem,12svh)] w-[min(8rem,12svh)] items-center justify-center"
          style={{ "--tile-tint": "var(--background)", animationDelay: "0.05s" } as CSSProperties}
        >
          <FaceView face={{ kind: "shape", shape }} size="tile" />
        </span>
      )}
      <ClayWord word={word} />
    </div>
  );
}
