"use client";

import { Volume2, VolumeX } from "lucide-react";
import { Button3D } from "@/components/ui/button-3d";
import { playSfx, unlockSound } from "@/lib/cue";
import { useSound } from "@/store/sound";

/**
 * The header's speaker chip, beside `ThemeToggle` and dressed the same: the
 * accent-pink clay face (`.btn3d--icon-accent`) in both themes, only the icon
 * changes. It silences every Learn sound — the words, the effects and the
 * reels (`store/sound.ts`, read by `lib/cue.ts` and `ReelVideo`). Turned back
 * on, it pops once, so the child hears that the sound is back.
 */
export function SoundToggle({ offLabel, onLabel }: { offLabel: string; onLabel: string }) {
  const muted = useSound((state) => state.muted);
  const hydrated = useSound((state) => state.hydrated);
  const toggleMuted = useSound((state) => state.toggleMuted);
  /* The server renders "on" — the store's un-hydrated default. */
  const isMuted = hydrated && muted;

  return (
    <Button3D
      tone={{ face: "var(--accent)", edge: "var(--accent-dark)", text: "#fff" }}
      aria-label={isMuted ? onLabel : offLabel}
      className="btn3d--icon-accent h-11 w-11 shrink-0"
      onClick={() => {
        toggleMuted();
        if (isMuted) {
          unlockSound();
          playSfx("tap");
        }
      }}
    >
      {isMuted ? (
        <VolumeX className="h-5 w-5" strokeWidth={2.25} />
      ) : (
        <Volume2 className="h-5 w-5" strokeWidth={2.25} />
      )}
    </Button3D>
  );
}
