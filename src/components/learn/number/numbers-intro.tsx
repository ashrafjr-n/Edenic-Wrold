import Image from "next/image";
import { POSE_IMAGE } from "./pinki-guide";
import type { PinkiPose } from "./pinki-guide";

interface NumbersIntroProps {
  /** What she says. Written to be read aloud once audio exists, same as the
      journey's lines. */
  line: string;
  /** Defaults to the pointing pose, which is the whole reason this exists. */
  pose?: PinkiPose;
}

/**
 * Pinki welcoming a child who has never finished a number, above the picker.
 *
 * **Deliberately NOT `PinkiGuide`, and it does not wrap one.** That component
 * is the compact guide that opens every stage of one number's journey, where
 * she sits beside the exercise and must not compete with it. This is the
 * opposite job: she is the largest thing on the page, she is the first thing
 * seen, and she leans toward the numbers below her. Those are two different
 * layouts, not one layout at two sizes — trying to serve both from one
 * component meant a `size` AND an `overlap` AND a `lean` knob, at which point
 * it is two components sharing a file. `PinkiGuide` is therefore untouched,
 * and the number journey cannot be affected by anything here.
 *
 * What IS shared is shared properly: `POSE_IMAGE` is imported rather than
 * restated, and the bubble is the same `.speech-bubble` block every other
 * bubble on the site uses — including its tail, which the stylesheet already
 * moves to the top below `sm` and to the left above it. That is exactly the
 * arrangement this uses, so no new CSS was needed for either breakpoint.
 *
 * **She overlaps the bubble rather than standing clear of it**, the same
 * "character breaks past the edge" language the home page's friends use. It
 * is not decoration: at 320px the grid already starts near the fold, so every
 * pixel this banner adds pushes the numerals she is pointing at further out
 * of sight. The overlap is what buys back most of the height doubling her
 * size costs.
 */
export function NumbersIntro({ line, pose = "stick" }: NumbersIntroProps) {
  return (
    <div className="anim-fade-up mb-7 flex w-full flex-col items-center sm:mb-9 sm:flex-row sm:items-center sm:justify-center sm:gap-7">
      {/* The lean lives on this wrapper, never on the image: `.anim-breathe`
          animates `transform` on the image itself, and a hand-written
          `transform: rotate()` there would be overwritten by the keyframe on
          every tick. Tailwind v4's `rotate` is its own standalone property,
          so on a PARENT the two compose instead of fighting. Anti-clockwise,
          so the stick — which the render holds up and to the left — dips
          toward the grid rather than away from it. The bubble stays upright:
          a tilted speech bubble reads as broken, not as playful. */}
      <span className="relative z-10 -mb-12 block rotate-[-8deg] sm:mb-0">
        <Image
          src={POSE_IMAGE[pose]}
          alt="Pinki"
          width={475}
          height={539}
          /* Without this, next/image serves a 1080px file into a 160px box. */
          sizes="(min-width: 640px) 224px, 160px"
          className="anim-breathe h-40 w-40 object-contain drop-shadow-[0_18px_24px_rgba(92,78,190,0.3)] sm:h-56 sm:w-56"
        />
      </span>

      {/* `pt-14` below `sm` is the overlap's other half: her feet land in the
          bubble's top padding, so the text starts clear of them rather than
          behind them. From `sm` she stands beside it and it is not needed. */}
      <p className="speech-bubble max-w-sm px-6 pb-5 pt-14 text-center text-lg font-bold text-[var(--color-ink)] sm:max-w-md sm:px-7 sm:py-5 sm:text-left sm:text-xl">
        {line}
      </p>
    </div>
  );
}
