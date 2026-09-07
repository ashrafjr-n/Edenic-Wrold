import type { CSSProperties } from "react";
import Image from "next/image";
import { Footprints } from "lucide-react";
import { Button3D } from "@/components/ui/button-3d";
import type { Dictionary } from "@/lib/dictionaries/en";
import { dirFor } from "@/lib/format-dict";
import trailCloud from "../../../public/assets/activity-page/trial/trial-cloude.png";

type ClayVars = CSSProperties & { "--clay-edge"?: string };

/**
 * The Play page's lead card: the way into the Edenic Trail.
 *
 * **It is the home page's own panel recipe** (`components/home/paths-section.tsx`)
 * at the size of a full-width lead card: a `.clay` slab, the copy in flow from
 * the top-left, one piece of art bedded into the fill on the right with
 * `.panel-art`, and a white clay button pinned to the bottom by `mt-auto`.
 * Same block, same materials, same reading order — this card and those two are
 * one pattern, so a change to the shape usually belongs in both.
 *
 * **This replaced a hand-built scene of five cloud stops with a friend
 * standing on every second one.** All of it — the `<Cloud />` strip, the
 * characters, the far cloud, the idle float — was removed on direct request;
 * the card carries one picture now. Don't rebuild that scene here. (`<Cloud />`
 * itself is untouched and still draws `/trail`'s sky.)
 *
 * **The art is a static import**, not a `/public` path: a static import is
 * content-hashed into its URL, so repainting the file on disk actually busts
 * the cache — the same trap `ui/logo.tsx` and the two game cards document.
 *
 * **The fill is `--color-bloo-dark`, a CHARACTER token, deliberately not
 * `--brand`.** `--brand` and `--accent` are both raised lighter in dark mode
 * for legibility as text elsewhere, and a lighter face is exactly where white
 * type on a panel washes out (the trap the header's own dark-mode rule
 * documents). Character tokens don't move with the theme, so this panel is the
 * same blue and the same contrast in both — and the art is already that blue,
 * which is what lets `.panel-art` fade it into the fill with no seam. That is
 * the same rule `data/home-paths.ts` picks its two pictures by.
 *
 * Where it deviates from the home panels, and why: it is twice their width, so
 * the art takes a smaller SHARE of it (`w-[46%]`, not `62%`) and the heading
 * runs a size larger; the art keeps its full opacity (the home panels drop
 * theirs to 95% — this one is a soft light blue on a mid blue already, and
 * `.panel-art`'s own left-and-bottom fade is doing plenty); the button keeps
 * the Trail's own lucide `Footprints`
 * rather than the generic `ArrowRight`; and it uses plain `.btn3d--clay-white`
 * rather than `home-path-btn`, whose dark-mode override turns those two
 * buttons dark purple to suit their own panels.
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
      /* `isolate` keeps the art's negative z-index inside the panel: it drops
         behind the text but stays above the panel's own fill, which is the
         only place it can read as bedded in. */
      className={`clay group relative isolate flex min-h-[19rem] flex-col items-start overflow-hidden rounded-[2rem] p-8 sm:min-h-[20rem] sm:p-10 lg:min-h-[21rem] lg:p-12 ${className}`}
      style={
        {
          backgroundColor: "var(--color-bloo-dark)",
          "--clay-edge": "var(--brand-dark)",
          ...style,
        } as ClayVars
      }
    >
      <div className="panel-art pointer-events-none absolute inset-y-0 -right-4 -z-10 w-[68%] sm:w-[58%] lg:w-[52%]">
        <Image
          src={trailCloud}
          /* Decorative — the panel's own heading names it. */
          alt=""
          fill
          sizes="(min-width: 1024px) 34rem, (min-width: 640px) 58vw, 68vw"
          className="object-contain object-bottom transition-transform duration-500 ease-out group-hover:scale-110"
        />
      </div>

      {/* Both lines carry `dir`: the title is a Latin brand name that must not
          be reordered inside an Arabic or Kurdish sentence, and the description
          ends on a bidi-neutral full stop, which takes the paragraph's LTR
          direction and jumps to the far right without one — see `dirFor`. */}
      <h2
        dir={dir}
        className="text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl"
      >
        {dict.trail.title}
      </h2>

      <p
        dir={dir}
        className="mt-3 max-w-[19rem] text-base leading-relaxed text-white/85 sm:max-w-[24rem]"
      >
        {dict.trail.description}
      </p>

      {/* White clay on a saturated panel: a coloured button disappears on one.
          Its text is `--color-ink-fixed`, not `--color-ink` — that face is
          pinned pale in both themes while `--color-ink` flips light in dark
          mode, which would leave pale on pale. */}
      <Button3D
        tone={{ face: "var(--surface)", text: "var(--color-ink-fixed)" }}
        variant="calm"
        href="/trail"
        className="btn3d--clay-white mt-auto px-6 py-3 text-base sm:px-7 sm:py-3.5 sm:text-lg"
      >
        <Footprints className="h-5 w-5" strokeWidth={2.25} />
        <span dir={dir}>{dict.trail.cta}</span>
      </Button3D>
    </article>
  );
}
