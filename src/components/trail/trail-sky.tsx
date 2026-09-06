import type { ReactNode } from "react";
import { Cloud, type CloudSize, type CloudTint, type CloudVariant } from "@/components/ui/cloud";

/** Which gradient the sky wears. All three run light at the top to deeper at
    the bottom, so a long scroll reads as descending through the sky; the
    fills themselves live in `globals.css` (`.trail-sky--*`). */
export type SkyPalette = "day" | "dawn" | "dream";

/**
 * The lanes a cloud can sit in, as a share of the sky's width, cycled in
 * order going DOWN — so the trail zig-zags left, middle, right, middle,
 * left… That is the shape the map needs: **every cloud here becomes a stage
 * node**, and stages have to read as a sequence a child's eye can follow,
 * not as scenery scattered at random.
 *
 * Centre lanes are deliberately repeated. Going straight from the left lane
 * to the right one makes the eye jump the full width of the page between two
 * consecutive stages; stepping through the middle halves every jump.
 */
const LANES = [26, 50, 74, 50];

/**
 * Per-stop wobble on the lane, in the same units. This is the "randomness" —
 * without it four lanes read as four ruled columns, which is a table, not a
 * trail. It is a fixed table rather than `Math.random()` for the reason every
 * other scattered thing on this site is (the puzzle tray, the confetti, the
 * quiz decoys): this renders on the server too, and a random offset would
 * hydrate mismatched.
 *
 * Its length is coprime with `LANES`', so lane and wobble drift against each
 * other and the pattern takes 4 x 7 stops to repeat — longer than any screen
 * shows at once.
 */
const WOBBLE = [-2.5, 1.5, -1, 3, -1.5, 2, -2];

/** Size, silhouette and tint all cycle on their own lengths too, for the same
    reason: no two adjacent stops should look like the same object twice.
    Sizes stay within one step of each other — these are stage nodes of equal
    weight, not near and far scenery. */
const SIZES: CloudSize[] = ["md", "sm", "md", "md", "sm"];
const VARIANTS: CloudVariant[] = [1, 2, 3];
const TINTS: CloudTint[] = ["white", "sky", "white", "lavender", "white", "pink", "sky"];

interface SkyCloud {
  top: string;
  left: string;
  size: CloudSize;
  variant: CloudVariant;
  tint: CloudTint;
}

/**
 * Where the stops sit, derived from the count rather than hand-placed.
 *
 * **Evenly spaced down the sky, in percentages.** The trail is one long
 * scroll whose height isn't known here, so a stop places itself as a share
 * of whatever height the sky ends up with — and because the spacing is
 * `(i + 0.5) / count`, thirty stops space themselves exactly as eight do,
 * with the same margin left at the top and bottom. Hand-written coordinates
 * would have to be rewritten every time a stage is added.
 */
function trailStops(count: number): SkyCloud[] {
  return Array.from({ length: count }, (_, index) => ({
    top: `${(((index + 0.5) / count) * 100).toFixed(2)}%`,
    left: `${LANES[index % LANES.length] + WOBBLE[index % WOBBLE.length]}%`,
    size: SIZES[index % SIZES.length],
    variant: VARIANTS[index % VARIANTS.length],
    tint: TINTS[index % TINTS.length],
  }));
}

interface TrailSkyProps {
  palette?: SkyPalette;
  /** How many cloud stops to lay out. Eight is enough to read the rhythm at
      the sky's current height; the real trail raises it. */
  stops?: number;
  /** The trail itself — the path drawn between the stops, their numbers, the
      characters — once it exists. Composition rather than more props: this
      component owns the sky and the clouds on it, nothing else. */
  children?: ReactNode;
  className?: string;
}

/**
 * The Edenic Trail's sky: a full-bleed gradient with a zig-zagging line of
 * clay clouds down it. **Background only** — no path drawn between them, no
 * stage numbers, no characters, no progress. That is still the whole scope
 * of this step.
 *
 * **One layer of clouds, and every one of them is a stop.** A background
 * layer of big low-contrast clouds (`DRIFT`, `.cloud--far`) drifted behind
 * these for a while and was removed on direct request: the sky reads as a
 * map when the only clouds on it are the ones a child can land on, and a
 * second washed-out set beside them read as haze rather than as depth.
 * `.cloud--far` itself stays — `TrailCta` still uses it.
 *
 * **The clouds are the future stage nodes, and they are placed as such.**
 * They were scattered freely at first, which looked like weather; a map
 * needs a sequence. So they are evenly spaced down the page, they alternate
 * lanes, and — unlike the first version — **none of them over-hangs the
 * edges**, because a stage a child has to tap cannot be half off-screen.
 *
 * **Full width, no `max-w`, taller than the viewport.** `svh`, not `vh` — on
 * a phone `vh` is measured with the browser chrome hidden, which is exactly
 * the amount a `100vh` box then overflows by (the same call
 * `.puzzle-upright` already makes).
 *
 * `overflow-hidden` still guards the edges: a lane plus its wobble plus half
 * a cloud stays inside, but horizontal overflow on a phone widens the LAYOUT
 * VIEWPORT and zooms the whole page out rather than merely adding a
 * scrollbar, so it is not worth leaving to arithmetic.
 */
export function TrailSky({
  palette = "day",
  stops = 8,
  children,
  className = "",
}: TrailSkyProps) {
  return (
    <div
      className={`trail-sky--${palette} relative isolate min-h-[100svh] w-full overflow-hidden ${className}`}
    >
      {trailStops(stops).map((cloud, index) => (
        <Cloud
          key={index}
          size={cloud.size}
          variant={cloud.variant}
          tint={cloud.tint}
          /* Centred ON its lane, not started at it — a lane is where the
             stage sits, and a cloud hung off the left of that mark would
             drift further right the bigger it got. */
          className="absolute -z-10 -translate-x-1/2"
          style={{ top: cloud.top, left: cloud.left }}
        />
      ))}

      {children}
    </div>
  );
}
