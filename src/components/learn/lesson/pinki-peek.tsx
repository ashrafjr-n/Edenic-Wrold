import Image from "next/image";
import type { PinkiPose } from "@/types/pinki";
import speak from "../../../../public/assets/learn-with-pinki/pinki/pinki-speak.png";
import pen from "../../../../public/assets/learn-with-pinki/pinki/pinki-with-pen.png";
import celebrate from "../../../../public/assets/learn-with-pinki/pinki/pinki-celebrate.png";
import stick from "../../../../public/assets/learn-with-pinki/pinki/pinki-with-a-stick.png";
import think from "../../../../public/assets/learn-with-pinki/pinki/pinki-think.png";

export const PINKI_POSES = { speak, pen, celebrate, stick, think } as const;

interface PinkiPeekProps {
  pose: PinkiPose;
  /** Counts reactions. Each new value is a new peek; 0 is none yet. */
  beat: number;
}

/**
 * Pinki, reacting: she leans in from the right edge of the screen — cheering
 * a right answer, thinking with the child after a miss — and slides away
 * again (`.pinki-peek`). She is never a fixture at the top of the page any
 * more; the task chip says what to do, she only says how it went.
 *
 * Keyed by `beat`, so every reaction replays from the start. The stage clips
 * her with `overflow-x-clip`; `pointer-events-none`, so she never blocks a tap.
 */
export function PinkiPeek({ pose, beat }: PinkiPeekProps) {
  if (beat === 0) return null;
  return (
    <span key={beat} aria-hidden className="pinki-peek pointer-events-none absolute bottom-20 right-0 z-10 sm:bottom-24">
      <Image src={PINKI_POSES[pose]} alt="" sizes="112px" className="h-24 w-auto object-contain sm:h-28" />
    </span>
  );
}
