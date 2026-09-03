import Image from "next/image";
import { POSE_IMAGE } from "./pinki-guide";
import type { PinkiPose } from "./pinki-guide";

interface NumbersIntroProps {
  /** The welcome. Carried by the screen-reader line below, and written to be
      read aloud once audio exists — same as the journey's lines. */
  line: string;
  /** Defaults to the pointing pose, which is the whole reason this exists. */
  pose?: PinkiPose;
}

/**
 * Pinki leaning into the picker, pointing a child who has never finished a
 * number at number 1.
 *
 * **She is an absolutely positioned layer inside the grid's card, not a
 * banner above it.** As a banner she cost 300px of vertical space at 320px,
 * which pushed the very numerals she points at off the bottom of the screen —
 * the guidance hid its own subject. Out of the flow she costs nothing: the
 * card is exactly the height it is without her.
 *
 * **She overlaps the locked numerals on purpose, and that is safe by
 * construction.** This only ever renders when nothing has been finished,
 * which is precisely when 2–9 are locked and `NumberGrid` draws them as
 * `<span>`s rather than links — measured: one tappable `<a>` in the grid,
 * eight inert. `pointer-events-none` makes that structural rather than a
 * coincidence of the lock rule, so a tap can always reach whatever is under
 * her even if that rule ever changes. Number 1 itself is never covered: it
 * is the one thing the child has to find.
 *
 * **The lean is what aims the stick, and a fixed angle genuinely works here.**
 * The angle from her hand to number 1's centre measures 41.8° at 320px and
 * 41.5° at 390px — the card and the grid scale together, so the bearing is
 * effectively constant and needs no JS to track it. The render's own stick
 * sits close to that already (its tip is up and to the LEFT of her hand,
 * which is exactly where number 1 is from here), so this is a few degrees of
 * correction rather than the new artwork an earlier, upright-and-above
 * composition would have needed.
 */
export function NumbersIntro({ line, pose = "stick" }: NumbersIntroProps) {
  return (
    <>
      {/* First in the card's DOM, so a screen reader hears the welcome BEFORE
          the "Numbers 0 / 9" count and the list of numerals it introduces —
          in context, rather than as a stray string somewhere in the page. The
          image below carries `alt=""` and `aria-hidden` precisely so this is
          announced once and not doubled by a description of the picture. */}
      <p className="sr-only">{line}</p>

      <span
        aria-hidden
        /* `anim-fade-up` animates `transform`, `.anim-breathe` on the image
           animates `transform` too — but `rotate` is its own standalone
           property in Tailwind v4, so it composes with both instead of being
           overwritten on every tick. This is why the lean is a utility here
           and never a hand-written `transform: rotate()`. */
        className="anim-fade-up pointer-events-none absolute bottom-0 right-0 z-10 block w-[58%] rotate-[-5deg] sm:w-[52%]"
      >
        <Image
          src={POSE_IMAGE[pose]}
          alt=""
          /* The painted size, not the file's 502x497 — next/image builds its
             srcset from these, and declaring the file size makes it serve a
             needlessly large image into a box this small. */
          width={360}
          height={357}
          className="anim-breathe h-auto w-full object-contain drop-shadow-[0_18px_26px_rgba(92,78,190,0.32)]"
        />
      </span>
    </>
  );
}
