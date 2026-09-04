import Image from "next/image";
import type { GuidePresence, PinkiPose } from "@/types/number-journey";

/* Re-exported so the existing `from "./pinki-guide"` imports keep resolving
   now that the union itself lives in `types/` — `data/number-guide.ts` names a
   pose for every stage, and a data module must not import from a component.
   Same call `store/progress.ts` makes for the key builders it keeps in `lib/`. */
export type { PinkiPose } from "@/types/number-journey";

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

/**
 * How big she is in each mode, and the size that box actually paints her at.
 *
 * **`painted` is the LARGEST size the box ever renders her, not the file's
 * 475×539.** `next/image` builds its srcset from the `width`/`height` it is
 * given: the file's own dimensions make it serve a needlessly large image into
 * a small box, and a box larger than the declared size gets an upscaled, soft
 * one. The renders are ~0.88 wide for their height and sit in a square box
 * under `object-contain`, so the height is what binds and the width follows
 * from that ratio. Change a class here and the pair below has to move with it.
 */
const PRESENCE = {
  hero: {
    box: "h-36 w-36 sm:h-60 sm:w-60",
    painted: { width: 211, height: 240 },
  },
  lead: {
    box: "h-32 w-32 sm:h-52 sm:w-52",
    painted: { width: 183, height: 208 },
  },
  aside: {
    box: "h-16 w-16 sm:h-24 sm:w-24",
    painted: { width: 85, height: 96 },
  },
} as const satisfies Record<
  Exclude<GuidePresence, "none">,
  { box: string; painted: { width: number; height: number } }
>;

interface PinkiGuideProps {
  pose?: PinkiPose;
  /** What she says. Written to be read aloud once audio exists. */
  line: string;
  /** How much of the screen she is here — see `GuidePresence`. Rendering
      nothing for `none` is handled here rather than by every caller, so the
      stage table in `data/number-guide.ts` stays the only thing deciding it. */
  presence?: GuidePresence;
}

/**
 * Pinki, saying something.
 *
 * She is the teacher on these pages, not a mascot in the corner, so every
 * stage opens with her — the child is being spoken to by someone, not
 * instructed by a screen. The line is always present: there is no audio yet,
 * and even once there is, a child who misses it must still be able to carry
 * on. In `aside` it is present without being visible (see below).
 *
 * **Her size is a statement about whose moment this is**, which is why this
 * takes a `presence` and not a `size`. In `lead`/`hero` she stands to the LEFT
 * of her bubble from `sm` up and above it on a phone, and `.speech-bubble`
 * moves its tail to match. In `aside` she has no bubble at all and is lifted
 * out of the flow entirely.
 */
export function PinkiGuide({
  pose = "speak",
  line,
  presence = "lead",
}: PinkiGuideProps) {
  if (presence === "none") return null;

  const { box, painted } = PRESENCE[presence];

  /* `anim-breathe` is the same idle float the unlocked characters use on the
     picker — it is what stops her reading as a sticker. */
  const portrait = (
    <Image
      src={POSE_IMAGE[pose]}
      alt={presence === "aside" ? "" : "Pinki"}
      width={painted.width}
      height={painted.height}
      priority={presence !== "aside"}
      className={`anim-breathe shrink-0 object-contain drop-shadow-[0_14px_18px_rgba(92,78,190,0.28)] ${box}`}
    />
  );

  if (presence === "aside") {
    return (
      /* Absolutely positioned, so she costs this stage NO height — the same
         reason `NumbersIntro` sits out of the picker's flow. These are the two
         stages whose content is the lesson (the reel, the balloon game), and a
         guide that pushed either one further down the page would be taking
         space from the thing she is there to introduce.

         `pointer-events-none` is structural, not decorative: she overlaps the
         bottom-left of a stage whose balloons wrap to fill the width, and a
         tap has to reach whatever is under her every time.

         The line is kept as `sr-only` rather than dropped. It is still part of
         the script that gets recorded when audio arrives, and a child using a
         screen reader should hear the same encouragement a sighted one sees on
         every other stage. */
      <>
        <p className="sr-only">{line}</p>

        <span
          aria-hidden
          className="anim-fade-up pointer-events-none absolute bottom-0 left-0 z-10 block"
        >
          {portrait}
        </span>
      </>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-5">
      {portrait}

      <p className="speech-bubble max-w-xs px-5 py-3 text-center text-base font-bold text-[var(--color-ink)] sm:max-w-sm sm:text-left sm:text-lg">
        {line}
      </p>
    </div>
  );
}
