import type { LetterId } from "@/types/letter-item";
import type { Locale } from "@/types/locale";

/**
 * Every sound Learn Letters will play, by name.
 *
 * Audio is not recorded yet, but the lesson is built as though it were: every
 * letter name, letter sound, taught word and line Pinki says already has an
 * id, and every button that will play one already calls `playCue`. The clips
 * land at `public/audio/<id>.mp3` and only `playCue` changes.
 */
export const cueFor = {
  letterName: (letter: LetterId) => `letters/name/${letter}`,
  /** The phonics sound — recorded by a person, never text-to-speech: a
      synthesiser says "ay" for A, not /æ/. */
  letterSound: (letter: LetterId) => `letters/sound/${letter}`,
  word: (word: string) => `letters/word/${word}`,
  /** One of Pinki's lines, in the child's language, for one letter/word. */
  pinki: (locale: Locale, line: string, subject: string) =>
    `pinki/${locale}/letters-${line}/${subject}`,
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
