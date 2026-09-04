import type { ReactNode } from "react";
import Image from "next/image";
import type { GuidePresence, PinkiPose } from "@/types/number-journey";

/* Re-exported so the existing `from "./pinki-guide"` imports keep resolving
   now that the union itself lives in `types/` — `data/number-guide.ts` names a
   pose for every stage, and a data module must not import from a component.
   Same call `store/progress.ts` makes for the key builders it keeps in `lib/`. */
export type { PinkiPose } from "@/types/number-journey";

/* Exported so the other layouts can reuse the map rather than restating it —
   `PinkiLean` needs the same paths at life size. */
export const POSE_IMAGE: Record<PinkiPose, string> = {
  speak: "/assets/learn-with-pinki/pinki/pinki-speak.png",
  pen: "/assets/learn-with-pinki/pinki/pinki-with-pen.png",
  celebrate: "/assets/learn-with-pinki/pinki/pinki-celebrate.png",
  stick: "/assets/learn-with-pinki/pinki/pinki-with-a-stick.png",
  think: "/assets/learn-with-pinki/pinki/pinki-think.png",
};

/**
 * The two IN-FLOW sizes, and the size each box actually paints her at.
 *
 * `lead` is not here: it is life size and out of the flow, so it comes from
 * `PinkiLean` instead — the same component and the same scale the number
 * picker's own Pinki uses.
 */
const PRESENCE = {
  /* The last and biggest thing on the celebration screen. **The desktop box
     is `h-64`, not the `h-80` it was**, and that is a fit, not a taste: the
     celebration's message became a real `.card` above her, and at 1440x900
     the column (card, buttons, her) ran 58px past the viewport at the larger
     size — her feet off the bottom of the screen on the one screen she is
     the point of. She is still by far the biggest object there, and the
     phone box is untouched. `painted` follows the box and the source PNG's
     own 502x497 aspect, so `next/image` neither upscales past the asset nor
     serves one three times the size it draws. */
  hero: {
    box: "h-48 w-48 sm:h-64 sm:w-64",
    painted: { width: 256, height: 253 },
  },
  aside: {
    box: "h-16 w-16 sm:h-24 sm:w-24",
    painted: { width: 85, height: 96 },
  },
} as const;

interface PinkiGuideProps {
  pose?: PinkiPose;
  /** What she says. Written to be read aloud once audio exists. */
  line: string;
  /** How much of the screen she is here — see `GuidePresence`. Rendering
      nothing for `none` is handled here rather than by every caller, so the
      stage table in `data/number-guide.ts` stays the only thing deciding it. */
  presence?: GuidePresence;
  /** The stage's own buttons. `lead` places them under her speech bubble, in
      the column her crop leaves free on the left; every other presence just
      renders them after her. Composition rather than a `buttons` prop, so the
      journey keeps owning what its actions ARE and this only decides where
      they sit relative to her. */
  children?: ReactNode;
}

/**
 * Pinki, saying something.
 *
 * She is the teacher on these pages, not a mascot in the corner, so every
 * stage has her — the child is being spoken to by someone, not instructed by a
 * screen. The line is always present: there is no audio yet, and even once
 * there is, a child who misses it must still be able to carry on. In `aside`
 * it is present without being visible.
 *
 * **Her size is a statement about whose moment this is**, which is why this
 * takes a `presence` and not a `size`. The three modes are genuinely three
 * different layouts, not one layout at three scales:
 *
 * - **`lead` is life size** — the same `PinkiLean` the number picker uses, at
 *   the same scale, leaning in from the right edge and cropped by it. The
 *   activity sits ABOVE her and she overlaps its lower edge; her bubble and
 *   the stage's buttons stack in the column her crop leaves on the left. She
 *   is out of the flow, so all of that costs the stage no height.
 * - **`hero`** is in the flow, above everything, on the one screen with no
 *   activity underneath her to cover.
 * - **`aside`** is small, cornered and silent — no bubble, her line carried by
 *   a screen-reader-only paragraph.
 */
export function PinkiGuide({
  pose = "speak",
  line,
  presence = "lead",
  children,
}: PinkiGuideProps) {
  if (presence === "none") return null;

  if (presence === "lead") {
    return (
      /* Just the LEFT column: her bubble, with the stage's buttons stacked
         under it. **Pinki herself is not here** — she is rendered by the
         journey as a direct child of its root, because she is sized as a
         share of that column's HEIGHT and has to be positioned against it.
         Nested in this row instead she would resolve her percentage against
         the bubble's own height and come out a few dozen pixels tall.

         The width is a SHARE of the journey column, not padding on a
         full-width box: this column has to be the part of the width her crop
         leaves free, and a `pr-%` on a `max-w`-capped box resolves its
         percentage against the cap rather than the column, which collapsed
         the bubble to 179px at 1440. The cap is on top of the share so a very
         wide desktop does not stretch one short line across half the page.

         `self-start` is not optional: the journey column is `items-center`,
         so without it this box centres itself and the "left column" ends up
         floating in the middle with Pinki lying across its right half. The
         share is wider from `sm` because the column grows much faster than
         she does there — at the phone value the bubble's tail ended up
         pointing across 150px of empty ground instead of at her. */
      /* `relative z-20` puts this column ABOVE `PinkiLean` (z-10). She is
         anchored to the bottom-right and wide enough to reach across this
         column on a narrow screen, and she used to be painted over the top of
         it — a button half-covered by her arm. She is `pointer-events-none`,
         so this was only ever a paint-order problem; the buttons always
         answered a tap. */
      <div className="relative z-20 flex w-[54%] max-w-md grow flex-col items-start gap-3 self-start sm:w-[66%] sm:max-w-2xl sm:gap-4">
        <p className="speech-bubble speech-bubble--left w-full px-4 py-2.5 text-left text-sm font-bold text-[var(--color-ink)] sm:px-5 sm:py-3 sm:text-base">
          {line}
        </p>

        {/* **The buttons are pinned to the BOTTOM of the column, not hung
            under the bubble.** `grow` on the column above makes it take all
            the height the stage leaves, and `mt-auto` pushes the actions to
            the far end of it — so the one thing to press sits low on the
            screen, down beside Pinki, instead of tight under the sentence
            asking for it with her leaning across both. A fixed margin was
            tried first and was far too small to read as a move at all; the
            distance has to come from the space that is actually free, which
            changes with the stage and the screen. `pt-6` is only a floor, for
            a stage whose activity is tall enough to leave almost none.
            **`mb-16` on a phone is a deliberate lift back OFF the bottom** —
            pinned flat against it the buttons sat on the bottom nav and read
            as part of it. Desktop needs no lift: the route's own `sm:pb-20`
            already leaves 120px under the column.
            Rendered only when the stage HAS actions, so an unsolved quiz
            never adds an empty box under the bubble. */}
        {children && (
          <div className="mb-16 mt-auto pt-6 sm:mb-0 sm:pt-8">{children}</div>
        )}
      </div>
    );
  }

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
      className={`anim-breathe shrink-0 object-contain ${box}`}
    />
  );

  if (presence === "aside") {
    return (
      /* Absolutely positioned, so she costs this stage NO height — the same
         reason `PinkiLean` is. These are the two stages whose content is the
         lesson (the reel, the balloon game), and a guide that pushed either
         one further down the page would be taking space from the thing she is
         there to introduce.

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

        {children}
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-5">
        {portrait}

        <p className="speech-bubble max-w-xs px-5 py-3 text-center text-base font-bold text-[var(--color-ink)] sm:max-w-sm sm:text-left sm:text-lg">
          {line}
        </p>
      </div>

      {children}
    </>
  );
}
