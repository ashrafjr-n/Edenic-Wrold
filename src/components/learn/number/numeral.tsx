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
  /** The white halo behind the numeral. On by default — it is what keeps a
      pink numeral legible on a pink ground. Turn it OFF when the numeral
      already stands on a pale tinted cell of its own: there the halo has a
      surface to fight with and washes a light blob into the middle of it. */
  bloom?: boolean;
  /** The corner padlock drawn on a locked numeral. Turn it OFF when the
      parent puts the lock on its own container instead — on a small cell the
      chip is sized against the CELL, not against the glyph, or it covers half
      the digit. */
  badge?: boolean;
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
 * A locked numeral is the same clay in a dormant lavender rather than the
 * site's usual light desaturation (see `.numeral-shadow--locked`): these are
 * the subject itself, not decoration on a card, so they have to read as "not
 * yet" at a glance across a grid of nine — without going grey, which is a
 * colour this site does not otherwise own.
 */
export function Numeral({
  value,
  image,
  sizeClass,
  locked = false,
  decorative = false,
  bloom = true,
  badge = true,
}: NumeralProps) {
  return (
    <span className={`relative flex items-center justify-center ${sizeClass}`}>
      {/* The bloom is its own layer, larger than the numeral, so it reads as
          a halo around it rather than a square of lighter background behind
          it. Held back on a locked numeral — the glow is what says "this one
          is open". */}
      {bloom && (
        <span
          className={`numeral-bloom pointer-events-none absolute -inset-4 sm:-inset-6 ${
            locked ? "opacity-30" : ""
          }`}
          aria-hidden
        />
      )}

      <Image
        src={image}
        alt={decorative ? "" : `The number ${value}`}
        width={414}
        height={600}
        className={`relative h-full w-full object-contain ${
          locked ? "numeral-shadow--locked" : "numeral-shadow"
        }`}
      />

      {locked && badge && (
        /* Corner-mounted, like the lesson cards' badge — centred, it covers
           the numeral and the child can no longer see which number it is.

           `.lock-chip`: the shared clay padlock, grained and inflated like
           every other object here. It replaced a flat white disc with a grey
           padlock in it, which was the one thing on the page made of neither
           clay nor card. */
        <span className="lock-chip absolute -right-1 -top-1 h-8 w-8 sm:h-9 sm:w-9">
          <Lock className="h-4 w-4 sm:h-4.5 sm:w-4.5" strokeWidth={2.75} />
        </span>
      )}
    </span>
  );
}
