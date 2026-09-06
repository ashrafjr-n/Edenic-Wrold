import type { CSSProperties } from "react";

export type CloudSize = "sm" | "md" | "lg";
/**
 * Which silhouette, so a sky full of clouds isn't one shape repeated. All
 * three share the 20:11 box `.cloud` locks its aspect ratio to.
 *
 * A fourth existed for one round — a wide, flat BANK at 40:11, for a cloud
 * that had to span a whole card, since a puff stretched that wide shows only
 * its middle lobe and reads as a white dome. It went when the card that
 * needed it was redesigned. Rebuild it (shape token, `aspect-ratio`, its own
 * lobe highlights) if something has to span like that again — but a row of
 * separate puffs is usually the better answer.
 */
export type CloudVariant = 1 | 2 | 3;
export type CloudTint = "white" | "sky" | "pink" | "lavender";

interface CloudProps {
  size?: CloudSize;
  variant?: CloudVariant;
  tint?: CloudTint;
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
  className = "",
  style,
}: CloudProps) {
  return (
    <span
      aria-hidden
      className={`cloud cloud--${size} cloud--${tint} ${
        variant === 1 ? "" : `cloud--v${variant}`
      } ${className}`}
      style={style}
    >
      <span className="cloud-body block" />
    </span>
  );
}
