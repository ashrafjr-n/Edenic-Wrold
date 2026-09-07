import type { CSSProperties } from "react";
import Image from "next/image";
import { Footprints } from "lucide-react";
import { Button3D } from "@/components/ui/button-3d";
import { Cloud, type CloudVariant } from "@/components/ui/cloud";
import { characters } from "@/data/characters";
import type { Dictionary } from "@/lib/dictionaries/en";
import { dirFor } from "@/lib/format-dict";

type ClayVars = CSSProperties & { "--clay-edge"?: string };

/**
 * The trail, as a strip of stops climbing across the foot of the panel — a
 * friend standing on every second one, in the order a child meets them
 * (Pinki first, Bloo last and highest).
 *
 * **Everything here is a share of the strip's HEIGHT, not its width**, and
 * that is what lets the strip run the panel's whole width at every
 * breakpoint without a single re-tuned number. A stop is a box with the
 * cloud's own `20 / 11` aspect ratio and a percentage HEIGHT, so its width
 * falls out of that — where a percentage width would have made every cloud
 * three times bigger on a desktop than on a phone. Only `left` is a share of
 * the width, which is the one thing that should stretch with the panel.
 *
 * **The two friendless stops are `sm:` only.** Five stops across a phone's
 * card width is a solid mass of overlapping white; three friends spread over
 * the same strip reads as a path. From `sm` the panel is wide enough for the
 * two stops still to come, which is what says the trail carries on.
 *
 * **Only the LAST stop over-hangs the panel** — the trail runs off the right,
 * the way it climbs. Pinki's used to run off the LEFT, which read as a
 * cropped mistake rather than a continuation: the cloud silhouette got wider
 * and flatter when `<Cloud />` was rebuilt on five lobes, so every `left` and
 * `height` here was re-set against the new proportions. Re-measure them if
 * the silhouette changes again.
 */
const STOPS = [
  { id: "pinki", left: 14, bottom: 2, height: 44, variant: 2, wide: false },
  { id: null, left: 33, bottom: 30, height: 24, variant: 3, wide: true },
  { id: "nova", left: 52, bottom: 6, height: 40, variant: 1, wide: false },
  { id: null, left: 72, bottom: 38, height: 22, variant: 2, wide: true },
  { id: "bloo", left: 93, bottom: 16, height: 36, variant: 3, wide: false },
] as const satisfies readonly {
  id: string | null;
  left: number;
  bottom: number;
  height: number;
  variant: CloudVariant;
  /** `true` = only from `sm`, where there is width for it. */
  wide: boolean;
}[];

const CHARACTER = Object.fromEntries(characters.map((c) => [c.id, c]));

/**
 * The Play page's lead card: the way into the Edenic Trail.
 *
 * **It is a `.clay` PANEL, not a `.card` — the site's most substantial
 * surface, at the biggest size anything on the site is drawn.** That is the
 * whole of this, its third design, and it replaces the previous two
 * outright: both were a white `.card` whose fill was swapped for the
 * `.trail-sky--*` gradient, with the copy in a column beside a scene box.
 * That reads as a pale blue rectangle with dark text on it — flat next to
 * the two photographic game cards below, and nothing like the rest of the
 * site's material. Don't go back to it.
 *
 * What a `.clay` panel brings that a `.card` cannot: the grain (a flat fill
 * reads as plastic — the design system's own rule), an inner top highlight
 * and inner bottom shade so the slab is inflated rather than printed, and a
 * wide drop shadow mixed from its own `--clay-edge`. It is the same block
 * the home page's two closing panels are built from, which is the nearest
 * thing this site has to a hero surface. `.clay` sets no `border-radius`, so
 * `rounded-[2rem]` composes with it safely (unlike `.card`/`.tile`, which
 * would silently win over a Tailwind radius utility).
 *
 * **The layout is a POSTER, not two columns.** Title, description and CTA
 * centred across the top, the trail as a full-width strip beneath them. The
 * old side-by-side split is what made this read as a third game card with
 * more text; stacked and centred, at full page width, it reads as the way
 * into a section. It also removes the copy-versus-art collision both earlier
 * versions had to be measured out of — the two are stacked siblings and can
 * never reach each other.
 *
 * **The fill is `--color-bloo-dark`, a CHARACTER token, deliberately not
 * `--brand`.** `--brand` and `--accent` are both raised lighter in dark mode
 * for legibility as text elsewhere, and a lighter face is exactly where
 * white type on a panel starts to wash out (the trap the header's own
 * dark-mode rule documents). Character tokens don't move with the theme, so
 * this panel is the same blue and the same contrast in both. Bloo's blue is
 * also the blue the trail sky itself is mixed from, so the card still reads
 * as a piece of that sky.
 *
 * **White type and a WHITE CLAY button, the home panels' recipe exactly** —
 * a coloured button on a saturated panel disappears, which is why
 * `paths-section.tsx` already solves it this way. Its text is
 * `--color-ink-fixed`, NOT `--color-ink`: `.btn3d--clay-white`'s face is
 * pinned pale in both themes, and `--color-ink` flips light in dark mode,
 * which would leave pale-on-pale. `home-path-btn` is deliberately NOT used —
 * that hook turns those two buttons dark purple in dark mode, which belongs
 * to their panels, not to this one.
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
    <article
      className={`clay relative isolate flex flex-col overflow-hidden rounded-[2rem] ${className}`}
      style={
        {
          backgroundColor: "var(--color-bloo-dark)",
          "--clay-edge": "var(--brand-dark)",
          ...style,
        } as ClayVars
      }
    >
      <div className="flex flex-col items-center gap-3 px-6 pt-8 text-center sm:gap-4 sm:px-10 sm:pt-12">
        {/* Both lines carry `dir`: the title is a Latin brand name that must
            not be reordered inside an Arabic or Kurdish sentence, and the
            description ends on a bidi-neutral full stop, which takes the
            paragraph's LTR direction and jumps to the far right without one —
            see `dirFor`. */}
        <h2
          dir={dir}
          className="text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl"
        >
          {dict.trail.title}
        </h2>

        <p
          dir={dir}
          className="max-w-xl text-sm font-medium leading-relaxed text-white/85 sm:text-base"
        >
          {dict.trail.description}
        </p>

        <Button3D
          tone={{ face: "var(--surface)", text: "var(--color-ink-fixed)" }}
          variant="calm"
          href="/trail"
          className="btn3d--clay-white mt-1 px-6 py-3.5 text-base sm:px-8 sm:py-4 sm:text-lg"
        >
          <Footprints className="h-5 w-5" strokeWidth={2.25} />
          <span dir={dir}>{dict.trail.cta}</span>
        </Button3D>
      </div>

      {/* The strip. Full panel width, no padding of its own, so the stops are
          cut by the panel's own edges — Bloo's runs off the right, which is
          what says the trail carries on past the card. */}
      <div
        aria-hidden
        className="relative mt-7 h-40 w-full sm:mt-9 sm:h-52 lg:h-60"
      >
        {/* One low-contrast cloud behind the stops. `.cloud--far` loses
            CONTRAST before opacity, so on a saturated panel it reads as haze
            at a distance rather than as a see-through cloud. The only far
            cloud left on the site, now that the sky's own layer is gone. */}
        <div className="absolute bottom-[30%] left-[31%] aspect-[20/11] h-[56%] -translate-x-1/2">
          <Cloud
            variant={3}
            tint="white"
            className="cloud--far"
            style={{ "--cloud-w": "100%" } as CSSProperties}
          />
        </div>

        {STOPS.map(({ id, left, bottom, height, variant, wide }, index) => (
          <div
            key={id ?? `gap-${index}`}
            /* `anim-breathe` on the WRAPPER, so a friend floats with the
               cloud she stands on rather than off it. It animates
               `transform` while the centring is `translate` — separate
               properties in Tailwind v4, so they compose. Staggered, or the
               whole strip rises and falls as one object. */
            className={`anim-breathe absolute aspect-[20/11] -translate-x-1/2 ${
              wide ? "hidden sm:block" : ""
            }`}
            style={{
              left: `${left}%`,
              bottom: `${bottom}%`,
              height: `${height}%`,
              animationDelay: `${index * 0.45}s`,
            }}
          >
            <Cloud
              variant={variant}
              tint="white"
              style={{ "--cloud-w": "100%" } as CSSProperties}
            />

            {/* Standing ON the cloud: the feet sit below the top of the big
                lobe, so the friend sinks into it rather than balancing on
                its outline. Percentages of the cloud's OWN box, so this
                holds at every size the panel takes. */}
            {id && (
              <div className="absolute bottom-[56%] left-[46%] aspect-square h-[116%] -translate-x-1/2">
                <Image
                  src={CHARACTER[id].image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 8rem, 5rem"
                  className="object-contain drop-shadow-[0_8px_12px_rgb(var(--shadow-hue)/28%)]"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </article>
  );
}
