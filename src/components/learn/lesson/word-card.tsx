import { CueButton } from "./cue-button";
import { ClayWord } from "./clay-word";

interface WordCardProps {
  word: string;
  /** The word's own clip — `lessonCue.word`. */
  cue: string;
  /** Names the speaker for a screen reader ("Hear circle"). */
  label: string;
}

/**
 * Meet the word: one big gold speaker (the word's clip, once audio lands) and
 * the English word underneath in clay letters. Nothing to get right here —
 * the lesson's Next is the way on.
 */
export function WordCard({ word, cue, label }: WordCardProps) {
  return (
    <div className="card card-clay-white flex w-full max-w-xl flex-col items-center gap-7 px-6 py-9 sm:gap-9 sm:py-12">
      <CueButton cue={cue} label={label} size="xl" invite />
      <ClayWord word={word} />
    </div>
  );
}
