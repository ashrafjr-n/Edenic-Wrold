"use client";

import { useEffect } from "react";
import Image from "next/image";
import { playCue } from "@/lib/cue";
import type { PinkiPose } from "@/types/pinki";
import { CueButton } from "./cue-button";

const POSE_IMAGE: Record<PinkiPose, string> = {
  speak: "/assets/learn-with-pinki/pinki/pinki-speak.png",
  pen: "/assets/learn-with-pinki/pinki/pinki-with-pen.png",
  celebrate: "/assets/learn-with-pinki/pinki/pinki-celebrate.png",
  stick: "/assets/learn-with-pinki/pinki/pinki-with-a-stick.png",
  think: "/assets/learn-with-pinki/pinki/pinki-think.png",
};

interface LessonCoachProps {
  pose: PinkiPose;
  line: string;
  /** The recording of `line` — see `lessonCue` in `lib/cue.ts`. */
  cue: string;
  listenLabel: string;
  dir: "rtl" | "ltr";
}

/**
 * Pinki, teaching: one line in her bubble, a speaker to hear it again, and
 * her pose for what the child is doing. The same place on every step — the
 * top of the screen, above the thing to do — so a child who cannot read yet
 * always knows where the instruction comes from.
 *
 * Her line is spoken the moment it changes (once audio exists — see
 * `playCue`). A lesson is only reached by a tap, so the browser's autoplay
 * rule is already satisfied.
 */
export function LessonCoach({ pose, line, cue, listenLabel, dir }: LessonCoachProps) {
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
