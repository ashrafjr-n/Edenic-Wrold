import Image from "next/image";
import { Lock } from "lucide-react";

interface NumeralProps {
  value: number;
  image: string;
  /** Tailwind box size, e.g. `"h-28 w-28"`. The numeral fills it. */
  sizeClass: string;
  locked?: boolean;
  /** Skips the alt text where a parent already labels the control. */
  decorative?: boolean;
}

/**
 * One clay numeral standing on the page — no card around it.
 *
 * A soft white bloom behind it (`.numeral-bloom`) is what keeps a pink
 * numeral legible on the pink ground, and the shadow is a `filter` so it
 * follows the numeral's own silhouette instead of a rectangle. Boxing these
 * in `.card`s turned the number grid into a sheet of containers and buried
 * the thing the child is looking at.
 *
 * Locked numerals go silver rather than the site's usual light desaturation:
 * these are the subject itself, not decoration on a card, so they have to
 * read as "not yet" at a glance across a grid of nine.
 */
export function Numeral({
  value,
  image,
  sizeClass,
  locked = false,
  decorative = false,
}: NumeralProps) {
  return (
    <span className={`relative flex items-center justify-center ${sizeClass}`}>
      {/* The bloom is its own layer, larger than the numeral, so it reads as
          a halo around it rather than a square of lighter background behind
          it. Held back on a locked numeral — the glow is what says "this one
          is open". */}
      <span
        className={`numeral-bloom pointer-events-none absolute -inset-4 sm:-inset-6 ${
          locked ? "opacity-30" : ""
        }`}
        aria-hidden
      />

      <Image
        src={image}
        alt={decorative ? "" : `The number ${value}`}
        width={414}
        height={600}
        className={`relative h-full w-full object-contain ${
          locked ? "numeral-shadow--locked" : "numeral-shadow"
        }`}
      />

      {locked && (
        /* Corner-mounted, like the lesson cards' badge — centred, it covers
           the numeral and the child can no longer see which number it is. */
        <span className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-[0_8px_18px_-6px_rgb(92_78_190_/_45%)] sm:h-9 sm:w-9">
          <Lock
            className="h-4 w-4 text-[var(--color-locked-text)] sm:h-4.5 sm:w-4.5"
            strokeWidth={2.75}
          />
        </span>
      )}
    </span>
  );
}
