/**
 * Every sound Learn plays goes through here, by id: a taught word
 * (`playCue`) or a sound effect (`playSfx`). The clips are
 * `public/assets/audio/<id>.mp3` — the words spoken by Kokoro TTS, the
 * effects synthesised (both made by `tools/sounds/`).
 *
 * Web Audio, not `<audio>`: a tap's sound must start on the tap (an
 * `<audio>` lags on a phone), and several play at once. The context starts
 * on the first tap (`unlockSound`), as browsers ask.
 */

/** Audio ids for a lesson. Step instructions have no clip — the task button
    shows how instead of saying it (direct request). */
export const lessonCue = {
  /** A taught English word on its own — the same clip in every locale. */
  word: (word: string) => `words/${word}`,
  /** A taught English sentence ("I like apples.", "3 apples") — named by
      its words and numbers. */
  sentence: (text: string) => `sentences/${text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
};

/** Learn's sound effects (`tools/sounds/sfx.py`). */
export type Sfx =
  | "tap"
  | "correct"
  | "oops"
  | "letter"
  | "found"
  | "pickup"
  | "chomp"
  | "plop"
  | "bubbles"
  | "whoosh"
  | "hooray"
  | "chest"
  | "star";

/** How long the "speaking" state lasts when a clip cannot play. */
const SPEAK_MS = 1200;

/** Bumped when a clip is made again, so the immutable cache lets it through. */
const V = 1;

let context: AudioContext | null = null;
const clips = new Map<string, Promise<AudioBuffer | null>>();

function audio(): AudioContext | null {
  if (typeof window === "undefined" || !window.AudioContext) return null;
  context ??= new AudioContext();
  if (context.state === "suspended") void context.resume();
  return context;
}

function load(id: string): Promise<AudioBuffer | null> {
  let clip = clips.get(id);
  if (!clip) {
    const ctx = audio();
    clip = !ctx
      ? Promise.resolve(null)
      : fetch(`/assets/audio/${id}.mp3?v=${V}`)
          .then((response) => (response.ok ? response.arrayBuffer() : Promise.reject(new Error(String(response.status)))))
          .then((bytes) => ctx.decodeAudioData(bytes))
          .catch(() => null);
    clips.set(id, clip);
  }
  return clip;
}

/** Plays clip `id`; resolves when it ends (at once if it cannot play).
    `rate` raises the pitch (and quickens it) — the letters' and finds' scale. */
function play(id: string, rate = 1, volume = 1): Promise<boolean> {
  const ctx = audio();
  if (!ctx) return Promise.resolve(false);
  return load(id).then(
    (buffer) =>
      new Promise((resolve) => {
        if (!buffer) return resolve(false);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.playbackRate.value = rate;
        const gain = ctx.createGain();
        gain.gain.value = volume;
        source.connect(gain).connect(ctx.destination);
        source.onended = () => resolve(true);
        source.start();
      }),
  );
}

/** Plays a taught word and resolves when it ends — every speaking animation
    has its beat even when the clip cannot play. */
export function playCue(id: string): Promise<void> {
  return play(id).then((played) => (played ? undefined : new Promise((resolve) => window.setTimeout(resolve, SPEAK_MS))));
}

/** The pentatonic scale a word's letters and a hunt's finds climb, in
    semitones from the clip's own note. */
const SCALE = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21];

/** Plays a sound effect; `step` raises it that many notes up the scale. */
export function playSfx(id: Sfx, step?: number): void {
  const rate = step === undefined ? 1 : 2 ** (SCALE[Math.min(step, SCALE.length - 1)] / 12);
  void play(`sfx/${id}`, rate, id === "tap" ? 0.6 : 1);
}

const EFFECTS: Sfx[] = ["tap", "correct", "oops", "letter", "found", "pickup", "chomp", "plop", "bubbles", "whoosh", "hooray", "chest", "star"];

/** The first tap: starts the audio context and fetches every effect (a few
    KB each), so none waits for the network when it is due. */
export function unlockSound(): void {
  if (!audio()) return;
  EFFECTS.forEach((id) => void load(`sfx/${id}`));
}
