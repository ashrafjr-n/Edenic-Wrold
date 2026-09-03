import Image from "next/image";

/** Pinki has five renders. Anything else falls back to `speak` rather than
    blocking a stage on art that does not exist yet. */
export type PinkiPose = "speak" | "pen" | "celebrate" | "stick" | "think";

/* Exported so a second layout can reuse the map rather than restating it —
   `NumbersIntro` needs the same paths at a different size. Nothing else
   about this component is shared: that one owns its own layout. */
export const POSE_IMAGE: Record<PinkiPose, string> = {
  speak: "/assets/learn-with-pinki/pinki/pinki-speak.png",
  pen: "/assets/learn-with-pinki/pinki/pinki-with-pen.png",
  celebrate: "/assets/learn-with-pinki/pinki/pinki-celebrate.png",
  stick: "/assets/learn-with-pinki/pinki/pinki-with-a-stick.png",
  think: "/assets/learn-with-pinki/pinki/pinki-think.png",
};

interface PinkiGuideProps {
  pose?: PinkiPose;
  /** What she says. Written to be read aloud once audio exists. */
  line: string;
  /** Bigger on the stages where she is the subject, not the sidebar. */
  size?: "sm" | "lg";
}

/**
 * Pinki, saying something.
 *
 * She is the teacher on these pages, not a mascot in the corner, so every
 * stage opens with her — the child is being spoken to by someone, not
 * instructed by a screen. The line is always visible text: there is no audio
 * yet, and even once there is, a child who misses it must still be able to
 * carry on.
 *
 * She stands to the LEFT of her bubble from `sm` up and above it on a phone;
 * `.speech-bubble` moves its tail to match.
 */
export function PinkiGuide({ pose = "speak", line, size = "sm" }: PinkiGuideProps) {
  const box =
    size === "lg"
      ? "h-28 w-28 sm:h-40 sm:w-40"
      : "h-20 w-20 sm:h-28 sm:w-28";

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-5">
      {/* `anim-breathe` is the same idle float the unlocked characters use on
          the picker — it is what stops her reading as a sticker. */}
      <Image
        src={POSE_IMAGE[pose]}
        alt="Pinki"
        width={475}
        height={539}
        priority
        className={`anim-breathe shrink-0 object-contain drop-shadow-[0_14px_18px_rgba(92,78,190,0.28)] ${box}`}
      />

      <p className="speech-bubble max-w-xs px-5 py-3 text-center text-base font-bold text-[var(--color-ink)] sm:max-w-sm sm:text-left sm:text-lg">
        {line}
      </p>
    </div>
  );
}
