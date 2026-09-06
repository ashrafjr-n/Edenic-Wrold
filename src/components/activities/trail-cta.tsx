import type { CSSProperties } from "react";
import Image from "next/image";
import { Footprints } from "lucide-react";
import { Button3D } from "@/components/ui/button-3d";
import { Cloud, type CloudVariant } from "@/components/ui/cloud";
import { characters } from "@/data/characters";
import type { Dictionary } from "@/lib/dictionaries/en";
import { dirFor } from "@/lib/format-dict";

/**
 * Three stops of the trail, climbing away to the right — a miniature of the
 * map itself rather than a picture of it, with one friend standing on each
 * in the order a child meets them. The card SHOWS what the description says:
 * a path you climb one stop at a time.
 *
 * `x` / `y` are shares of the scene box and `width` is the cloud's width as
 * a share of it too, so the whole arrangement scales with the box and
 * nothing needs re-tuning per breakpoint. The lower stops are slightly
 * larger — the only depth cue here, and enough at three stops.
 */
const STOPS = [
  { id: "bloo", x: "19%", y: "4%", width: "40%", variant: 2 },
  { id: "nova", x: "51%", y: "34%", width: "38%", variant: 1 },
  { id: "pinki", x: "81%", y: "64%", width: "33%", variant: 3 },
] as const satisfies readonly {
  id: string;
  x: string;
  y: string;
  width: string;
  variant: CloudVariant;
}[];

const CHARACTER = Object.fromEntries(characters.map((c) => [c.id, c]));

/**
 * The Play page's lead card: the way into the Edenic Trail.
 *
 * **The scene is a miniature of the map — three cloud stops climbing away
 * with a friend on each.** This is the SECOND design of this card and a
 * deliberate replacement for the first, which was one wide cloud BANK across
 * the bottom with all three friends standing together on it: it filled half
 * the card with a flat white mass, said nothing about what the Trail is, and
 * was called out as bad. A card for a stage map should show stages. The
 * `variant={4}` bank shape that version needed is deleted with it.
 *
 * **The clouds are the site's own `<Cloud />`, over the same `.trail-sky--day`
 * gradient `/trail` itself wears** — blue by day, navy by night — so the card
 * is a window onto the page it opens rather than unrelated art, and it costs
 * no image request beyond the three character renders the site already ships.
 *
 * **Bigger than `PuzzleCta` / `MemoryMatchCta`, and deliberately not their
 * `16:9`.** It spans both grid columns at the top of the page: a section of
 * the site, not a third game. Its height comes from its own content rather
 * than a fixed ratio, so a longer Arabic or Kurdish line grows the card
 * instead of being clipped by a ratio tuned to English.
 *
 * **Copy and scene are flex SIBLINGS, never overlapping layers.** They stack
 * on a phone and sit side by side from `lg`; nothing is positioned against
 * the card itself, so no length of translated title can collide with the
 * art — the failure mode both earlier versions of this card had to be
 * measured out of.
 */
export function TrailCta({
  dict,
  className = "",
  style,
}: {
  dict: Dictionary;
  className?: string;
  style?: CSSProperties;
}) {
  const dir = dirFor(dict.locale);

  return (
    <div
      className={`card trail-sky--day relative isolate flex flex-col overflow-hidden lg:flex-row lg:items-center ${className}`}
      style={style}
    >
      {/* Copy. `order` puts the scene on top on a phone without moving the
          heading in the DOM, so a screen reader still meets the title first
          at every width. */}
      <div className="order-2 flex flex-col items-start gap-3 p-6 pt-1 sm:p-8 sm:pt-2 lg:order-1 lg:w-[48%] lg:shrink-0 lg:p-10">
        {/* `--color-ink` / `--color-ink-soft`, NOT the `-fixed` pair: this
            card's own sky follows the theme, so its text has to follow with
            it. The fixed tokens are for text on a face pinned to one value
            regardless of theme — using them here shipped a title that went
            dark-on-dark the moment dark mode was on.

            Both lines carry `dir`: the title is a Latin brand name that must
            not be reordered inside an Arabic or Kurdish sentence, and the
            description ends on a bidi-neutral full stop, which takes the
            paragraph's LTR direction and jumps to the far right without one —
            see `dirFor`. */}
        <h2
          dir={dir}
          className="text-3xl font-bold leading-tight text-[var(--color-ink)] sm:text-4xl"
        >
          {dict.trail.title}
        </h2>

        <p
          dir={dir}
          className="max-w-md text-sm font-medium leading-relaxed text-[var(--color-ink-soft)] sm:text-base"
        >
          {dict.trail.description}
        </p>

        <Button3D
          tone={{ face: "var(--brand)", edge: "var(--brand-dark)" }}
          href="/trail"
          className="mt-2 px-6 py-3.5 text-base sm:px-8 sm:py-4 sm:text-lg"
        >
          <Footprints className="h-5 w-5" strokeWidth={2} />
          <span dir={dir}>{dict.trail.cta}</span>
        </Button3D>
      </div>

      {/* The scene. A fixed RATIO rather than a height, so every offset below
          stays a share of one box whose shape never changes. */}
      <div
        aria-hidden
        className="order-1 flex w-full justify-center p-6 pb-2 sm:p-8 sm:pb-2 lg:order-2 lg:flex-1 lg:p-8"
      >
        <div className="relative aspect-[8/5] w-full max-w-[23rem] lg:max-w-[30rem]">
          {STOPS.map(({ id, x, y, width, variant }) => (
            <div
              key={id}
              className="absolute -translate-x-1/2"
              style={{ left: x, bottom: y, width }}
            >
              <Cloud
                variant={variant}
                tint="white"
                style={{ "--cloud-w": "100%" } as CSSProperties}
              />

              {/* Standing ON the cloud: the feet sit below the top of the big
                  lobe, so the friend sinks into it rather than balancing on
                  its outline. Percentages of the cloud's OWN box, so this
                  holds at every size the card takes. */}
              <div className="absolute bottom-[56%] left-[46%] aspect-square h-[116%] -translate-x-1/2">
                <Image
                  src={CHARACTER[id].image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 7rem, 5rem"
                  className="object-contain drop-shadow-[0_8px_12px_rgb(var(--shadow-hue)/22%)]"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
