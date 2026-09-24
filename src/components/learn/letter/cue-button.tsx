"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Volume2 } from "lucide-react";
import { playCue } from "@/lib/cue";
import { Button3D } from "@/components/ui/button-3d";

interface CueButtonProps {
  /** The sound to play — see `cueFor` in `lib/cue.ts`. */
  cue: string;
  /** Names the button for a screen reader; the face is often a picture. */
  label: string;
  /** What is on the button beside the speaker; none makes it a round icon. */
  children?: ReactNode;
  size?: "sm" | "lg";
  /** Pulse softly until first pressed — "you can press this". */
  invite?: boolean;
}

/* Gold is the site's say-it colour: saying and hearing, never an action. */
const GOLD = {
  face: "var(--color-gold)",
  edge: "var(--color-gold-dark)",
  text: "var(--color-ink-fixed)",
};

/**
 * A button that plays a sound: a letter's name or sound, a word, Pinki's
 * line. The ring and the jump are the "it is speaking" state, so the button
 * already reads as sound with the audio still to come.
 */
export function CueButton({ cue, label, children, size = "lg", invite = false }: CueButtonProps) {
  const [speaking, setSpeaking] = useState(false);
  const [pressed, setPressed] = useState(false);

  const play = () => {
    if (speaking) return;
    setPressed(true);
    setSpeaking(true);
    void playCue(cue).then(() => setSpeaking(false));
  };

  const box = children
    ? size === "lg"
      ? "gap-2.5 px-6 py-3.5 text-xl sm:px-7 sm:py-4 sm:text-2xl"
      : "gap-2 px-4 py-2.5 text-base"
    : size === "lg"
      ? "h-14 w-14 sm:h-16 sm:w-16"
      : "h-11 w-11";

  return (
    <span className="relative inline-flex shrink-0">
      {(speaking || (invite && !pressed)) && (
        <span
          className={`say-pulse pointer-events-none absolute inset-0 rounded-full ${
            speaking ? "" : "say-pulse--invite"
          }`}
          style={{ backgroundColor: "var(--color-gold)" }}
          aria-hidden
        />
      )}
      <Button3D
        tone={GOLD}
        onClick={play}
        aria-label={label}
        className={`relative font-bold ${box} ${speaking ? "anim-jump" : ""}`}
      >
        <Volume2
          className={size === "lg" ? "h-6 w-6 sm:h-7 sm:w-7" : "h-5 w-5"}
          strokeWidth={2.75}
        />
        {children}
      </Button3D>
    </span>
  );
}
