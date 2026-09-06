import type { CSSProperties } from "react";
import Image from "next/image";
import { Footprints } from "lucide-react";
import { Button3D } from "@/components/ui/button-3d";
import { Cloud, type CloudVariant } from "@/components/ui/cloud";
import { characters } from "@/data/characters";
import type { Dictionary } from "@/lib/dictionaries/en";
import { dirFor } from "@/lib/format-dict";

/**
 * The stops of the trail, climbing away from the bottom-left corner — a
 * miniature of the map rather than a picture of it, with a friend standing
 * on every second one in the order a child meets them (Pinki first, at the
 * near end; Bloo highest, where the child is going).
 *
 * **Five stops, not three, and two of them stand empty.** Three friends on
 * three clouds reads as a group photo; a climb needs stops still to come, or
 * nothing on the card says the path continues. The empty ones are also the
 * small ones, which is the only depth cue here and enough at this size.
 *
 * `x` / `y` / `width` are all shares of the scene box, which is a fixed
 * RATIO at every breakpoint — so one table holds from a phone to a desktop
 * and nothing is re-tuned per width. Stop 1 deliberately over-hangs the box
 * on the left: the card clips it, which is what says the sky carries on past
 * the edge. Nothing here is tappable, so an over-hang costs nothing (unlike
 * `TrailSky`'s stops, which are future buttons and stay fully inside).
 *
 * **Stepping-stone dots between the stops were built and cut.** Derived from
 * these coordinates, two per gap, they looked right on paper and wrong on
 * screen: consecutive clouds overlap horizontally at this scale, so every
 * dot landed either behind a cloud or on top of one and read as specks. The
 * climb itself is what says "trail" here.
 */
const STOPS = [
  { id: "pinki", x: 16, y: 3, width: 40, variant: 2 },
  { id: null, x: 47, y: 24, width: 24, variant: 3 },
  { id: "nova", x: 74, y: 34, width: 34, variant: 1 },
  { id: null, x: 30, y: 55, width: 20, variant: 2 },
  { id: "bloo", x: 63, y: 58, width: 28, variant: 3 },
] as const satisfies readonly {
  id: string | null;
  x: number;
  y: number;
  width: number;
  variant: CloudVariant;
}[];

const CHARACTER = Object.fromEntries(characters.map((c) => [c.id, c]));

/**
 * The Play page's lead card: the way into the Edenic Trail.
 *
 * **Built to `PuzzleCta` / `MemoryMatchCta`'s recipe, one size up.** Those
 * two are a full-bleed scene with one clay button on it; this is the same
 * card with a bigger scene, a heading and a description in it, and no fixed
 * `16:9` — it leads the page because it is the same shape with more in it,
 * not because it is a different kind of object. Its height comes from its
 * own content, so a longer Arabic or Kurdish line grows the card instead of
 * being clipped by a ratio tuned to English.
 *
 * **The scene is FULL-BLEED, and that is the whole redesign.** This card's
 * second version boxed a small three-cloud diagram inside a padded column
 * beside the text, on a flat blue rectangle: next to two rich photographic
 * cards it read as empty, which is what was called out. So the sky now runs
 * edge to edge, the trail climbs across the whole of it, the clouds are cut
 * by the card's own edges, and the fill carries the site's `--noise` grain —
 * the design system's own rule that a flat colored surface reads as plastic
 * (`.clay` and every colored `.btn3d` already blend the same texture).
 *
 * **The clouds are the site's own `<Cloud />`, over the same
 * `.trail-sky--day` gradient `/trail` itself wears** — blue by day, indigo
 * and starred by night — so the card is a window onto the page it opens
 * rather than unrelated art, and it costs no image request beyond the three
 * character renders the site already ships.
 *
 * **The CTA is `--accent` pink, and it has to be a colour the sky is not.**
 * Brand blue is this card's own ground; a blue button on it vanishes, the
 * same trap the numbers journey documents for a pink button on Pinki's pink
 * page. Pink is the site's stated counterweight to blue, and it also keeps
 * the three Play cards on three colours — green, gold, pink.
 *
 * **The text stays `--color-ink` / `--color-ink-soft`, NOT the `-fixed`
 * pair.** This card's sky follows the theme, so its text has to follow with
 * it; the fixed tokens are for text on a face pinned to one value, and using
 * them here once shipped a title that went dark-on-dark the moment dark mode
 * was on.
 *
 * **Copy and scene are flex SIBLINGS, never overlapping layers.** They stack
 * on a phone and sit side by side from `lg`; nothing is positioned against
 * the card itself, so no length of translated title can collide with the
 * art — the failure mode the first two versions of this card had to be
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
      {/* The grain. `.clay` and every colored `.btn3d` blend `--noise` into
          their own fill with `background-blend-mode`; this fill belongs to
          `.trail-sky--*`, which `/trail` shares, so the texture rides its own
          layer here instead of being baked into a gradient two pages use.
          `-z-10` inside the `isolate` parent puts it above the sky and below
          everything else, the same trick `.panel-art` uses on the home
          panels. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage: "var(--noise)",
          mixBlendMode: "overlay",
          opacity: 0.6,
        }}
      />

      {/* Copy. `order` puts the scene on top on a phone without moving the
          heading in the DOM, so a screen reader still meets the title first
          at every width. */}
      <div className="order-2 flex flex-col items-start gap-3 p-6 pt-2 sm:p-9 sm:pt-3 lg:order-1 lg:w-[44%] lg:shrink-0 lg:p-12">
        {/* Both lines carry `dir`: the title is a Latin brand name that must
            not be reordered inside an Arabic or Kurdish sentence, and the
            description ends on a bidi-neutral full stop, which takes the
            paragraph's LTR direction and jumps to the far right without one —
            see `dirFor`. */}
        <h2
          dir={dir}
          className="text-4xl font-bold leading-[1.1] tracking-tight text-[var(--color-ink)] sm:text-5xl"
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
          tone={{ face: "var(--accent)", edge: "var(--accent-dark)" }}
          href="/trail"
          className="mt-3 px-6 py-3.5 text-base sm:px-8 sm:py-4 sm:text-lg"
        >
          <Footprints className="h-5 w-5" strokeWidth={2} />
          <span dir={dir}>{dict.trail.cta}</span>
        </Button3D>
      </div>

      {/* The scene. No padding of its own, so the clouds reach the card's
          top, bottom and right edges and are cut by them. A fixed RATIO
          rather than a height, so every offset in `STOPS` stays a share of
          one box whose shape never changes — and, being the tallest child at
          `lg`, it is what sets the card's height there. */}
      <div
        aria-hidden
        className="relative order-1 aspect-[7/5] w-full lg:order-2 lg:flex-1"
      >
        {/* One big, low-contrast cloud drifting behind the stops. The only
            `.cloud--far` left on the site — the sky's own background layer
            was removed — and it is what keeps the card from reading as one
            plane of equally-crisp clouds. */}
        <Cloud
          variant={3}
          tint="white"
          className="cloud--far absolute bottom-[36%] left-[40%] -translate-x-1/2"
          style={{ "--cloud-w": "72%" } as CSSProperties}
        />

        {STOPS.map(({ id, x, y, width, variant }, index) => (
          <div
            key={id ?? `gap-${index}`}
            /* `anim-breathe` on the WRAPPER, so the friend floats with the
               cloud she is standing on rather than off it. It animates
               `transform` while the centring is `translate` — separate
               properties in Tailwind v4, so they compose. Staggered, or five
               clouds rise and fall as one object. */
            className="anim-breathe absolute -translate-x-1/2"
            style={{
              left: `${x}%`,
              bottom: `${y}%`,
              width: `${width}%`,
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
                holds at every size the card takes. */}
            {id && (
              <div className="absolute bottom-[56%] left-[46%] aspect-square h-[116%] -translate-x-1/2">
                <Image
                  src={CHARACTER[id].image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 9rem, 6rem"
                  className="object-contain drop-shadow-[0_8px_12px_rgb(var(--shadow-hue)/22%)]"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
