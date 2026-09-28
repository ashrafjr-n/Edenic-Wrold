/**
 * Every sound a lesson plays goes through here, by id.
 *
 * Audio is not recorded yet, but lessons are built as though it were: every
 * button that will play a sound already calls `playCue`. The clips land at
 * `public/audio/<id>.mp3` and only `playCue` changes.
 */

/** Audio ids for a lesson's lines. A question's line is its own clip (it
    names the taught word); the praise and help lines are shared by every
    lesson. The locale is in the id because Pinki speaks the child's
    language — the English taught word sits inside the sentence. */
export const lessonCue = {
  ask: (locale: string, character: string, course: string, lesson: number, question: number) =>
    `${locale}/${character}/${course}/${lesson}/q${question + 1}`,
  line: (locale: string, character: string, key: string) => `${locale}/${character}/lines/${key}`,
  /** A taught English word on its own — the same clip in every locale. */
  word: (word: string) => `words/${word}`,
};

/** How long the "speaking" state lasts without a clip. Once audio lands this
    is the clip's own length. */
const SPEAK_MS = 1200;

/** Plays one cue and resolves when it ends. TODO(audio): load
    `/audio/${id}.mp3` with howler.js and resolve on `end`; until then it only
    keeps the timing, so every speaking animation already has its beat. */
export function playCue(id: string): Promise<void> {
  void id;
  return new Promise((resolve) => window.setTimeout(resolve, SPEAK_MS));
}
