"use client";

import { useState } from "react";
import { Volume2 } from "lucide-react";

interface SayItButtonProps {
  /** The number as a word: "One". */
  word: string;
}

/* Gold, not the character's accent and not brand blue. The accent disappears
   into this page's own pink ground, and blue is already carrying "Let's draw"
   right beside it — two blues would read as two equal ways onward. Gold is the
   one colour left that is neither a mascot's identity nor a primary action,
   and it ties saying the word to the stars the child is working toward. */
const SAY_TONE = {
  face: "var(--color-gold)",
  edge: "var(--color-gold-dark)",
} as const;

/** How long the "it is speaking" state lasts. Once real audio lands this
    becomes the clip's own duration instead of a timer. */
const SPEAK_MS = 1400;

/**
 * "Can you say ONE?" — the big button a child presses to hear the word.
 *
 * **There is no audio yet.** This is the slot it will play into, built and
 * placed now so adding a clip later changes nothing about the layout or the
 * flow: the press, the pulse, the speaking state and the timing are all
 * already here, and only the `play()` call is missing.
 *
 * It still earns its place silently — pressing it makes the word jump and
 * ripple, which is enough for a child to connect the shape to the word even
 * with the sound off.
 */
export function SayItButton({ word }: SayItButtonProps) {
  const [speaking, setSpeaking] = useState(false);

  const say = () => {
    if (speaking) return;
    setSpeaking(true);
    /* TODO(audio): play the clip for `word` here and clear on `ended`. */
    window.setTimeout(() => setSpeaking(false), SPEAK_MS);
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* The ring is what reads as sound. It only exists while speaking, so a
          resting button is silent in the visual language too. */}
      {speaking && (
        <span
          className="say-pulse pointer-events-none absolute inset-0 rounded-full"
          style={{ backgroundColor: SAY_TONE.face }}
          aria-hidden
        />
      )}

      <button
        type="button"
        onClick={say}
        aria-label={`Say ${word}`}
        className={`btn3d relative gap-3 px-8 py-4 text-xl font-bold sm:px-10 sm:py-5 sm:text-2xl ${
          speaking ? "anim-jump" : ""
        }`}
        style={{
          "--btn-face": SAY_TONE.face,
          "--btn-edge": SAY_TONE.edge,
          "--btn-text": "#fff",
        } as React.CSSProperties}
      >
        <Volume2 className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2.75} />
        {word.toUpperCase()}
      </button>
    </div>
  );
}
