import Image from "next/image";
import { POSE_IMAGE } from "./pinki-guide";
import type { PinkiPose } from "@/types/number-journey";

/**
 * The places a life-size Pinki leans into the page, and the numbers that make
 * each one work.
 *

 * **Both are sized by the HEIGHT of the box they are positioned against, never
 * its width.** That box's aspect ratio changes a lot between a phone and a
 * desktop, so a width percentage makes her a different fraction of it at every
 * size; a height percentage holds her steady. The measured figure runs a few
 * points above the declared one because a rotated element's bounding box is
 * the axis-aligned box of the rotated shape, not the shape.
 *
 * `painted` is the size the box actually renders her at, which is what
 * `next/image` needs to build a sensible srcset — see the note on the `Image`
 * below.
 */
const LEAN = {
  /**
   * One number's journey. Same scale and the same crop against the right
   * edge, against the journey column instead of the picker's card — the two
   * containers are the same width at every breakpoint (both `px-6` inside a
   * centred max-width), so the same offsets land the same way.
   *
   * The phone percentage is lower than the picker's only because the journey
   * column is TALLER than the picker's card there, so a smaller share of it
   * comes out at the same number of pixels — measured at 390x844: 373px
   * against the picker's 360px.
   *
   * From `sm` the relationship inverts and the percentage has to go UP: the
   * journey column is SHORTER than the picker's card at desktop widths (694px
   * against 882px at 1440x900), so the picker's own 62% would have left her a
   * third smaller here rather than the same size.
   */
  journey: {
    box: "block -bottom-[1%] -right-[24%] h-[62%] sm:-bottom-[2%] sm:-right-[12%] sm:h-[72%]",
    painted: { width: 372, height: 368 },
  },
  /**
   * `journey`, dropped a little, for the `give` count activity — the apple
   * tray. Same size, just standing lower: the items grew on direct request
   * and at the standard placement her head sat straight under them, so the
   * tray and her face were competing for the same band of a phone screen. She
   * loses a little more of her feet to the bottom edge, which is the crop
   * every other placement already takes.
   *
   * Deliberately NOT `journeyLow`: that one drops much further AND comes down
   * a size, which is right for a tall board with a piece tray under it and
   * wrong here, where nothing needs clearing below the items.
   */
  journeyGive: {
    box: "block -bottom-[7%] -right-[24%] h-[62%] sm:-bottom-[8%] sm:-right-[12%] sm:h-[72%]",
    painted: { width: 372, height: 368 },
  },
  /**
   * `journey`, dropped and trimmed for the `count` activities whose board is
   * TALL. It was built for two of them — `complete` carried a piece tray
   * under the numeral and `path` winds a route down the height of its card —
   * but `complete` now gets no Pinki at all (`data/number-guide.ts` gives it
   * `presence: "none"`), so this placement is exercised by `path` alone. At
   * the standard placement she covered the bottom 145px of that board on a
   * phone (measured at 390x844), which is exactly where the loose piece
   * sits — the child could not see the thing they were being asked to drag.
   *
   * Lower ALONE cannot fix it: clearing a 346px board with a 396px figure
   * would put her feet 70px below the screen. So she drops and comes down a
   * size together, which leaves the whole activity visible with her head and
   * her stick still in frame, cropped by the bottom nav the way every other
   * placement is cropped by an edge. Measured: board bottom 512, her top 508.
   *
   * **`-right-[24%]` on a phone moved to `-right-[18%]`, on direct request**
   * ("shift her a little left") — she sat that much further into the right
   * edge's crop than the activity beside her needed; the `sm` figure and
   * every other number are untouched.
   */
  journeyLow: {
    box: "block -bottom-[18%] -right-[18%] h-[56%] sm:-bottom-[12%] sm:-right-[12%] sm:h-[62%]",
    painted: { width: 372, height: 368 },
  },
  /**
   * `journey`, dropped a little on a phone only, for the `color` count
   * activity. Direct request: at the standard `-bottom-[1%]` she stood close
   * enough to the top of `.numeral-stage`'s own card that her head touched
   * it. `color`'s board isn't tall like `complete`'s/`path`'s, so this only
   * needs a small drop, not `journeyLow`'s size-down too. `sm` is untouched —
   * the desktop sidebar layout doesn't have the same board directly above her.
   */
  journeyColor: {
    box: "block -bottom-[7%] -right-[24%] h-[62%] sm:-bottom-[2%] sm:-right-[12%] sm:h-[72%]",
    painted: { width: 372, height: 368 },
  },
} as const;

export type LeanPlacement = keyof typeof LEAN;

interface PinkiLeanProps {
  pose: PinkiPose;
  placement: LeanPlacement;
}

/**
 * Pinki, life-size, leaning into the page from the edge she is cropped by.
 *
 * **She is an absolutely positioned layer that BREAKS OUT of its container,
 * and she costs that container no height at all.** That is the whole reason
 * she can be this big: as an in-flow banner the same figure cost 300px at
 * 320px and pushed the very thing she was pointing at off the bottom of the
 * screen — guidance hiding its own subject. Out of the flow she is free.
 *
 * Everything below is load-bearing, and every line of it was paid for once
 * already on the picker:
 *
 * - **The container must NOT have `overflow-hidden`, and the page's `<main>`
 *   MUST have `overflow-x-hidden`.** She deliberately runs past the right and
 *   bottom edges — the crop is the design — so the container cropping her
 *   instead would undo it. But on a phone she also extends past the viewport,
 *   and horizontal overflow there does not merely add a scrollbar: it widens
 *   the LAYOUT VIEWPORT and zooms the whole page out. `<main>` is what absorbs
 *   that. `relative` on the container is only there to position her.
 * - **`w-auto max-w-none` on the image is what lets her be wider than her
 *   container.** Tailwind's preflight caps images at `max-width: 100%`, which
 *   would squash her back inside instead of letting the edge crop her.
 * - **`pointer-events-none` is structural, not decorative.** She lies over
 *   content the child may need to reach, and a tap has to pass through her
 *   every time — not merely wherever today's layout happens to leave a gap.
 * - **Three separate animated properties, and none of them may become a
 *   hand-written `transform`.** `.anim-pinki-lean-in` animates `translate`,
 *   `.anim-breathe` on the image animates `transform`, and the lean is
 *   `rotate`. They compose only because they are three different properties.
 * - **The lean is -3°, chosen against -5° and -7° in the browser.** Past about
 *   5° she reads as tipping over rather than standing.
 *
 * She enters from the edge that crops her, which is the point: it makes the
 * crop read as her leaning in rather than as a picture that did not fit.
 */
export function PinkiLean({ pose, placement }: PinkiLeanProps) {
  const { box, painted } = LEAN[placement];

  return (
    <span
      aria-hidden
      className={`anim-pinki-lean-in pointer-events-none absolute z-10 rotate-[-3deg] ${box}`}
    >
      <Image
        src={POSE_IMAGE[pose]}
        alt=""
        /* The PAINTED size, not the file's 502x497 — `next/image` builds its
           srcset from these, so the file's own dimensions make it serve a
           needlessly large image and a too-small value makes it serve a soft,
           upscaled one. */
        width={painted.width}
        height={painted.height}
        className="anim-breathe h-full w-auto max-w-none object-contain"
      />
    </span>
  );
}
