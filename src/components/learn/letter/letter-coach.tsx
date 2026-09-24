"use client";

import { useEffect } from "react";
import Image from "next/image";
import { POSE_IMAGE } from "@/components/learn/number/pinki-guide";
import type { PinkiPose } from "@/types/number-journey";
import { playCue } from "@/lib/cue";
import { CueButton } from "./cue-button";

interface LetterCoachProps {
  pose: PinkiPose;
  line: string;
  /** The recording of `line` — see `cueFor.pinki`. */
  cue: string;
  listenLabel: string;
  dir: "rtl" | "ltr";
}

/**
 * Pinki, teaching: one line in her bubble, a speaker to hear it again, and
 * her pose for what the child is doing. The same place on every exercise —
 * the top of the screen, above the thing to do — so a child who cannot read
 * yet always knows where the instruction comes from.
 *
 * Her line is spoken the moment it changes (once audio exists — see
 * `playCue`). The session is only reached by a tap, so the browser's
 * autoplay rule is already satisfied.
 */
export function LetterCoach({ pose, line, cue, listenLabel, dir }: LetterCoachProps) {
  useEffect(() => {
    void playCue(cue);
  }, [cue]);

  return (
    <div className="flex w-full max-w-2xl items-end gap-2 sm:gap-4">
      <div className="flex flex-1 items-center gap-2.5 sm:gap-3">
        {/* Speaker first: the bubble's tail points right, at Pinki. */}
        <CueButton cue={cue} label={listenLabel} size="sm" />
        <p
          dir={dir}
          className="speech-bubble speech-bubble--left flex-1 px-4 py-2.5 text-start text-base font-bold text-[var(--color-ink)] sm:px-5 sm:py-3 sm:text-lg"
        >
          {line}
        </p>
      </div>

      <Image
        key={pose}
        src={POSE_IMAGE[pose]}
        alt=""
        width={112}
        height={112}
        sizes="(min-width: 640px) 112px, 80px"
        className="anim-breathe h-20 w-auto shrink-0 object-contain sm:h-28"
      />
    </div>
  );
}
