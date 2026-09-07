import type { CSSProperties } from "react";

export type CloudSize = "sm" | "md" | "lg";
/**
 * Which silhouette, so a sky full of clouds isn't one shape repeated. All
 * three share the 20:11 box `.cloud` locks its aspect ratio to.
 *
 * **4 is a different KIND of object, not a fourth puff**: a wide, flat BANK
 * at 40:11 with its own `aspect-ratio`, for a cloud that has to SPAN
 * something — a puff stretched that wide shows only its middle lobe and
 * reads as a white dome. It was deleted for a round and restored for the
 * page-transition drift, where three banks cover the screen with no vertical
 * seams at all. Pair it with `.cloud--stretch` (via `className`) to give it
 * an explicit height; the shape is authored `preserveAspectRatio='none'`, so
 * it simply reads as a longer bank.
 */
export type CloudVariant = 1 | 2 | 3 | 4;
export type CloudTint = "white" | "sky" | "pink" | "lavender";

interface CloudProps {
  size?: CloudSize;
  variant?: CloudVariant;
  tint?: CloudTint;
  /** This is the one stage that's open right now — brighter lobes, a soft
      white glow behind it, and a slow breathing scale (reusing
      `.anim-pulse-invite`, the same "tap me" pulse the numbers picker puts
      on its own next-up numeral). Purely a look: it never locks, dims, or
      recolors any other cloud. */
  active?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * One clay cloud. Decoration only — `aria-hidden`, no text, no events.
 *
 * **A CSS mask over a single gradient box, not a stack of `border-radius`
 * divs and not an inline SVG drawing.** The silhouette is
 * `--cloud-shape-1|2|3` in `globals.css` (overlapping opaque ellipses on a
 * rounded base bar, the same mask technique `--hero-shape` uses for the home
 * hero). Overlapping divs each carry their own shading, so every join
 * between two lobes shows as a seam and the clay read falls apart; one mask
 * over one box gives an unbroken silhouette with a single continuous
 * top-to-bottom gradient under it, which IS the inflated clay look. It also
 * keeps colour in the stylesheet where the rest of this site keeps it — a
 * tint is one class, and dark mode re-mixes all four in one place.
 *
 * **Two elements, deliberately.** `filter` applies before `mask` on the same
 * element, so the outer drop shadow has to come from the wrapper or it would
 * be clipped away with everything outside the cloud — the trap
 * `.numeral-mask` already documents. `.cloud` carries the shadow and the
 * size; `.cloud-body` carries the mask and the fill.
 *
 * **Sizing is `--cloud-w`, not a `w-*` utility.** Two competing Tailwind
 * width classes race on source order, so a caller could not reliably widen a
 * `size="lg"` cloud; an inline `--cloud-w` always wins over the size class.
 * The trail card uses that to run one cloud the full width of its scene.
 *
 * **Built for motion, with none of it built.** A later idle float belongs on
 * the WRAPPER as a `translate` animation (its own property in Tailwind v4,
 * composited, so it fights neither the mask nor the filter) with a
 * per-cloud `animationDelay` passed through `style` — the same way
 * `AppleGive` staggers its three items. Nothing here has to be restructured
 * for it. Note the project animates with plain CSS keyframes, not
 * framer-motion (see CLAUDE.md "Libraries").
 */
export function Cloud({
  size = "md",
  variant = 1,
  tint = "white",
  active = false,
  className = "",
  style,
}: CloudProps) {
  return (
    <span
      aria-hidden
      className={`cloud cloud--${size} cloud--${tint} ${
        variant === 1 ? "" : `cloud--v${variant}`
      } ${active ? "cloud--active anim-pulse-invite" : ""} ${className}`}
      style={style}
    >
      <span className="cloud-body block" />
    </span>
  );
}
