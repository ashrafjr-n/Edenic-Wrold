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
 *
 * **She is deliberately CROPPED by the card's right edge**, which is why the
 * card carries `overflow-hidden` and why she enters by sliding in from that
 * same edge: the crop has to read as her leaning into the page, not as a
 * picture that did not fit.
 *
 * **-3°, chosen against -5° and -7° in the browser.** The lean is small for
 * two reasons that point the same way: past about 5° she stops reading as
 * standing and starts reading as tipping over, and — counter-intuitively —
 * a DEEPER anti-clockwise lean aims the stick WORSE. Flattening it swings
 * the tip toward the bottom-left corner (7, 4) when the target is up and
 * left; the stick gets closer to number 1 as the lean approaches zero.
 * Aiming it dead-on would need roughly +10° the other way, which tips her
 * backwards, away from the grid. So this gestures at the numerals rather
 * than striking number 1 exactly — which is what the reference does too.
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
        /* Sized by the card's HEIGHT, not its width. The card's aspect ratio
           changes a lot between a phone and a desktop, so a width percentage
           would make her a different fraction of the card at every size; a
           height percentage keeps her the same share of it everywhere.
           `w-auto` + `max-w-none` on the image is what lets her run wider
           than the card and be cropped by it — Tailwind's preflight caps
           images at `max-width: 100%`, which would otherwise squash her
           back inside instead.

           `.anim-pinki-lean-in` animates `translate`, `.anim-breathe` on the
           image animates `transform`, and `rotate` here is a third,
           standalone property. All three compose rather than overwriting one
           another — which is exactly why none of them is a hand-written
           `transform`. */
        className="anim-pinki-lean-in pointer-events-none absolute -bottom-[9%] -right-[26%] z-10 block h-[63%] rotate-[-3deg] sm:-bottom-[7%] sm:-right-[9%] sm:h-[58%]"
      >
        <Image
          src={POSE_IMAGE[pose]}
          alt=""
          /* The painted size, not the file's 502x497 — next/image builds its
             srcset from these, and declaring the file size makes it serve a
             needlessly large image into a box this small. */
          width={360}
          height={357}
          className="anim-breathe h-full w-auto max-w-none object-contain drop-shadow-[0_18px_26px_rgba(92,78,190,0.32)]"
        />
      </span>
    </>
  );
}
