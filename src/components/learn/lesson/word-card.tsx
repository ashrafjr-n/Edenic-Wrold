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
    <div className="card card-clay-white flex w-full max-w-xl flex-col items-center gap-4 px-6 py-6 sm:gap-7 sm:py-10 lg:max-w-none lg:gap-[min(2rem,3svh)] lg:py-[min(3rem,5svh)] [@media(max-height:700px)]:gap-2 [@media(max-height:700px)]:py-2.5">
      <CueButton cue={cue} label={label} size="xl" invite />
      {shape && (
        <span
          className="anim-pop-in flex h-[min(10rem,17svh)] w-[min(10rem,17svh)] items-center justify-center lg:h-[min(13rem,17svh)] lg:w-[min(13rem,17svh)]"
          style={{ animationDelay: "0.05s" }}
        >
          <FaceView face={{ kind: "shape", shape }} size="tile" />
        </span>
      )}
      <ClayWord word={word} />
    </div>
  );
}
