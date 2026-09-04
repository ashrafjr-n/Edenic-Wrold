import { PinkiLean } from "./pinki-lean";
import type { PinkiPose } from "@/types/number-journey";

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
 * **The picture, the crop and the sizing all live in `PinkiLean`**, which the
 * journey's `lead` stages use at the same scale. What stays here is the only
 * thing that is genuinely about THIS page: which pose, and the screen-reader
 * line that has to lead the card's reading order.
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
 * **The lean gestures at the numerals; it does not strike number 1 exactly.**
 * Counter-intuitively a DEEPER anti-clockwise lean aims the stick WORSE — it
 * swings the tip toward the bottom-left corner (7, 4) when the target is up
 * and left, so the stick gets closer to number 1 as the lean approaches zero.
 * Aiming it dead-on would need roughly +10° the other way, which tips her
 * backwards, away from the grid. The reference this was built from is equally
 * approximate. The angle itself lives in `PinkiLean`.
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

      <PinkiLean pose={pose} placement="picker" />
    </>
  );
}
