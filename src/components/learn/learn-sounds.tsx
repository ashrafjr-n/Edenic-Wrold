"use client";

import { useEffect } from "react";
import { playSfx, unlockSound } from "@/lib/cue";

/**
 * Every button and link in Learn pops when pressed — one listener for all
 * of them, so no button needs a handler of its own (and `Button3D` stays a
 * Server Component). A press on something with a sound of its own (a
 * letter tile, a food, the word's speaker) is marked `data-sfx="none"`.
 * The first press also starts the audio (`unlockSound`). A `click`, not a
 * `pointerdown`: a finger that lands on a stop to scroll the world is not a
 * press, and Enter on a focused button is.
 */
export function LearnSounds() {
  useEffect(() => {
    const onPress = (event: MouseEvent) => {
      unlockSound();
      if (!(event.target instanceof Element)) return;
      const pressed = event.target.closest("main a, main button");
      if (pressed && !pressed.closest("[data-sfx='none']")) playSfx("tap");
    };
    document.addEventListener("click", onPress, true);
    return () => document.removeEventListener("click", onPress, true);
  }, []);
  return null;
}
