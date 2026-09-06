import type { ReactNode } from "react";
import { Cloud, type CloudSize, type CloudTint, type CloudVariant } from "@/components/ui/cloud";

/** Which gradient the sky wears. All three run light at the top to deeper at
    the bottom, so a long scroll reads as descending through the sky; the
    fills themselves live in `globals.css` (`.trail-sky--*`). */
export type SkyPalette = "day" | "dawn" | "dream";

interface SkyCloud {
  /** Percentages, never pixels — the sky is one tall scrolling page whose
      height isn't known here, so every cloud has to place itself as a share
      of whatever height it ends up with. */
  top: string;
  left?: string;
  right?: string;
  size: CloudSize;
  variant: CloudVariant;
  tint: CloudTint;
  /** `far` clouds sit further away: bigger, and only SLIGHTLY faded. Depth
      is mostly size — the fade is held at 80% because the clay shading (the
      per-lobe highlights and the underside band) is what makes a cloud read
      as an object at all, and at the 55% this started on it washed straight
      into the sky and the big background clouds went flat again. No blur
      either: expensive on the phones doing the scrolling. */
  far?: boolean;
}

/** Eight clouds, alternating sides down the sky so nothing stacks and no
    band of it is left empty. Left/right edges are deliberately over-hung
    (`-4%`) so a few run off the side and the sky reads as bigger than the
    screen — the container clips them. */
const CLOUDS: SkyCloud[] = [
  { top: "3%", left: "-4%", size: "lg", variant: 2, tint: "white", far: true },
  { top: "10%", right: "5%", size: "md", variant: 1, tint: "sky" },
  { top: "22%", left: "11%", size: "sm", variant: 3, tint: "white" },
  { top: "33%", right: "-3%", size: "lg", variant: 1, tint: "lavender", far: true },
  { top: "46%", left: "3%", size: "md", variant: 2, tint: "white" },
  { top: "57%", right: "13%", size: "sm", variant: 1, tint: "pink" },
  { top: "69%", left: "-2%", size: "lg", variant: 3, tint: "sky", far: true },
  { top: "83%", right: "7%", size: "md", variant: 3, tint: "white" },
];

interface TrailSkyProps {
  palette?: SkyPalette;
  /** The trail itself — path, stage nodes, characters — once it exists.
      Composition rather than more props: this component owns the sky and
      nothing else. */
  children?: ReactNode;
  className?: string;
}

/**
 * The Edenic Trail's sky: a full-bleed gradient with clouds scattered down
 * it. **Background only** — no path, no stage nodes, no characters. That is
 * the whole point of this step: settle how the sky looks before anything is
 * built on top of it.
 *
 * **Full width, no `max-w`, and taller than the viewport.** The trail is a
 * long vertical scroll, so the sky is `min-h-[100svh]` by default and grows
 * with whatever it's given (`className` can raise the floor). `svh`, not
 * `vh` — on a phone `vh` is measured with the browser chrome hidden, which
 * is exactly the amount a `100vh` box then overflows by (the same call
 * `.puzzle-upright` already makes).
 *
 * **Cloud positions are percentages, so they spread over any height.** At
 * `100svh` they fill one screen; at three times that they spread across the
 * whole scroll without being re-tuned, which is what makes this safe to
 * drop a 30-stage path into later.
 *
 * `overflow-hidden` is not cosmetic: several clouds deliberately over-hang
 * the edges, and horizontal overflow on a phone widens the LAYOUT VIEWPORT
 * and zooms the whole page out (the bug `PuzzleBoard`'s own comment
 * documents at length), rather than merely adding a scrollbar.
 */
export function TrailSky({ palette = "day", children, className = "" }: TrailSkyProps) {
  return (
    <div
      className={`trail-sky--${palette} relative isolate w-full overflow-hidden min-h-[100svh] ${className}`}
    >
      {CLOUDS.map((cloud, index) => (
        <Cloud
          /* Position and size are the only things telling two clouds of the
             same variant apart, so the index belongs in the key — the list
             is static and never reorders. */
          key={`${cloud.top}-${index}`}
          size={cloud.size}
          variant={cloud.variant}
          tint={cloud.tint}
          className={`absolute -z-10 ${cloud.far ? "opacity-80" : "opacity-100"}`}
          style={{ top: cloud.top, left: cloud.left, right: cloud.right }}
        />
      ))}

      {children}
    </div>
  );
}
