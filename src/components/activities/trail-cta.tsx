import type { CSSProperties } from "react";
import Image from "next/image";
import { Footprints } from "lucide-react";
import { Button3D } from "@/components/ui/button-3d";
import { Cloud } from "@/components/ui/cloud";
import { characters } from "@/data/characters";
import type { Dictionary } from "@/lib/dictionaries/en";
import { dirFor } from "@/lib/format-dict";

/**
 * The three friends standing on the cloud bank, in the arc `FriendPod` uses
 * on the home page: the middle one higher and larger, the two beside her
 * lower and smaller. A flat row of three at one size reads as a lineup; this
 * reads as a group standing together.
 *
 * **Every number is a share of the BANK's own box**, which is a fixed height
 * at each breakpoint and roughly the card's width — so a friend stands on
 * the same part of the silhouette at every size, and the x values map almost
 * one-to-one onto the card. `foot` follows the bank's real profile — the silhouette's own
 * top at that x, then a few points LOWER so each friend sinks into the
 * cloud rather than balancing on its outline, which is what reads as
 * standing rather than hovering. Read them against `--cloud-shape-4` in
 * `globals.css` if the shape is ever redrawn.
 */
const CAST = [
  { id: "pinki", x: "53%", foot: "76%", height: "46%" },
  { id: "nova", x: "66%", foot: "86%", height: "58%" },
  { id: "bloo", x: "80%", foot: "69%", height: "43%" },
] as const;

const CHARACTER = Object.fromEntries(characters.map((c) => [c.id, c]));

/**
 * The Play page's lead card: the way into the Edenic Trail.
 *
 * **It replaced `FriendWorldTeaser`** — the "Coming Soon" placeholder card
 * for the friend-world feature, a gradient with the three renders on it and
 * nowhere to go. This one is a real link to a real route, so that card's
 * "deliberately not a link, the badge is the whole message" reasoning does
 * not carry over to it.
 *
 * **The scenery is the site's own `<Cloud />`, not a picture.** One cloud,
 * wider than the card and dropped most of the way below its bottom edge, so
 * what shows is a bank running the full width with the three friends
 * standing on it — over the same sky gradient `/trail` itself wears
 * (`.trail-sky--dawn`), so the card is a window onto the page it opens
 * rather than unrelated art. It costs no image request either: the cloud is
 * a CSS mask over a gradient, and the only downloads are the three character
 * renders the site already ships.
 *
 * **Bigger than `PuzzleCta` / `MemoryMatchCta`, and deliberately not their
 * `16:9`.** It spans both grid columns at the top of the page and is taller
 * than either, so it reads as a different WEIGHT of thing — a section of the
 * site, not a third game. Its height is a `min-h` floor rather than a fixed
 * ratio, so a longer Arabic or Kurdish line grows the card instead of being
 * clipped by a ratio tuned to English.
 *
 * **The copy is in flow and the scene is absolute, and that is the safe way
 * round.** Text sits at the card's top left; the bank is pinned to the
 * bottom and can never push it. The one thing the two could fight over is
 * the friends, and they stand in the card's RIGHT half while the copy is
 * capped to its left — checked at 320 through 1440 in all three languages,
 * since a translated title is a different length in every one of them.
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
      className={`card trail-sky--dawn relative isolate flex min-h-[27rem] flex-col justify-start overflow-hidden sm:min-h-[28rem] lg:min-h-[23rem] ${className}`}
      style={style}
    >
      {/* The scene. `-z-10` inside the card's own `isolate`: negative
          z-index children paint ABOVE the parent's background and below its
          in-flow content, which is exactly the layer a backdrop wants.

          The bank is given an explicit HEIGHT and allowed to stretch
          (`.cloud--stretch` drops the variant's aspect ratio) rather than
          being sized by width — a width-driven box changes height with the
          card and every offset on it would need re-tuning per breakpoint.
          Fixed height per breakpoint, over-hung past both edges so it runs
          off the sides, and dropped below the bottom edge so it reads as a
          bank the card is resting on rather than a shape parked inside it. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-[-5%] bottom-[-2rem] -z-10 h-[11rem] sm:bottom-[-2.5rem] sm:h-[13rem] lg:bottom-[-3rem] lg:h-[15rem]"
      >
        <Cloud
          size="lg"
          variant={4}
          tint="white"
          className="cloud--stretch absolute inset-0 h-full"
          style={{ "--cloud-w": "100%" } as CSSProperties}
        />

        {CAST.map(({ id, x, foot, height }, index) => (
          <div
            key={id}
            className="absolute aspect-square -translate-x-1/2"
            style={{
              height,
              left: x,
              bottom: foot,
              /* The middle friend stands in front where the three overlap —
                 she is the tallest, so anything else reads as her being cut
                 in half by a neighbour. */
              zIndex: index === 1 ? 2 : 1,
            }}
          >
            <Image
              src={CHARACTER[id].image}
              alt=""
              fill
              sizes="(min-width: 1024px) 10rem, (min-width: 640px) 9rem, 7rem"
              className="object-contain drop-shadow-[0_10px_16px_rgb(var(--shadow-hue)/20%)]"
            />
          </div>
        ))}
      </div>

      {/* Copy. Capped to the card's left half from `lg` so it can never run
          under the friends; on a phone it has the full width and the bank
          sits below it. */}
      <div className="flex flex-col items-start gap-3 p-6 sm:p-8 lg:max-w-[52%] lg:p-10">
        {/* `--color-ink` / `--color-ink-soft`, NOT the `-fixed` pair: this
            card's own sky gradient follows the theme (`.trail-sky--dawn` has
            a dark-mode fill), so its text has to follow with it. The fixed
            tokens are for text on a face pinned to one value regardless of
            theme — using them here shipped a title that went dark-on-dark
            and all but vanished the moment dark mode was on, which is the
            exact mistake CLAUDE.md's "Header conventions" rule warns about,
            caught in a dark-mode screenshot.

            Both lines carry `dir`: the title is a Latin brand name that must
            not be reordered inside an Arabic or Kurdish sentence, and the
            description ends on a bidi-neutral full stop, which takes the
            paragraph's LTR direction and jumps to the far right without one —
            see `dirFor`. */}
        <h2
          dir={dir}
          className="text-3xl font-bold leading-tight text-[var(--color-ink)] sm:text-4xl lg:text-[2.6rem]"
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
    </div>
  );
}
