import Image from "next/image";
import { POSE_IMAGE } from "./pinki-guide";
import type { PinkiPose } from "@/types/number-journey";

/**
 * The two places a life-size Pinki leans into the page, and the numbers that
 * make each one work.
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
   * The number picker. She points a child who has never finished a number at
   * number 1, and the composition is tuned to exactly that: the bearing from
   * her hand to number 1 measures 41.8° at 320px and 41.5° at 390px, so a
   * fixed angle genuinely tracks it. **Do not retune these against the journey
   * below** — they answer a different question.
   *
   * `painted` stays at the value the picker has always shipped. She renders
   * larger than this at desktop widths, but the source PNG is 502x497, so
   * declaring the desktop box would only ask `next/image` to upscale past the
   * asset. Raising it is an asset problem, not a markup one.
   */
  picker: {
    box: "-bottom-[3%] -right-[26%] h-[68%] sm:-bottom-[2%] sm:-right-[9%] sm:h-[62%]",
    painted: { width: 360, height: 357 },
  },
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
    box: "-bottom-[1%] -right-[24%] h-[62%] sm:-bottom-[2%] sm:-right-[12%] sm:h-[72%]",
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
      className={`anim-pinki-lean-in pointer-events-none absolute z-10 block rotate-[-3deg] ${box}`}
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
        className="anim-breathe h-full w-auto max-w-none object-contain drop-shadow-[0_18px_26px_rgba(92,78,190,0.32)]"
      />
    </span>
  );
}
