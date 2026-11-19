import type { CSSProperties } from "react";
import Image from "next/image";
import { Hourglass, Search } from "lucide-react";
import type { Dictionary } from "@/lib/dictionaries/en";
import { dirFor } from "@/lib/format-dict";
import findCard from "../../../public/assets/play/find/find-card.jpg";

/** Third of Play's cards, built to `PuzzleCta`'s recipe — full-bleed `16:9`
    picture, a light wash, one thing centred on top — with **pink leading**
    (`--accent` into `--brand`). The picture is Nova's kitchen counter, the
    Find game's first place, laid from the Vegetables course's own renders.

    Find is not built yet, so it is not a link: where the other cards have
    their button, it wears Discover's white "Coming soon" sign
    (`.discover-soon`). When the game lands, the sign becomes a pink
    `Button3D` to it. */
export function FindCta({
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
    <div aria-disabled className={`card relative aspect-[16/9] overflow-hidden ${className}`} style={style}>
      <Image
        src={findCard}
        placeholder="blur"
        alt={dict.activities.findCtaAlt}
        dir={dir}
        fill
        sizes="(min-width: 1024px) 24rem, 100vw"
        className="object-cover"
      />

      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(160deg, color-mix(in srgb, var(--accent) 55%, transparent) 0%, color-mix(in srgb, var(--brand) 45%, transparent) 100%)",
        }}
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
        {/* Its name on Watch's pink clay chip (`.discover-chip--new`), a size
            up — a chip, not a button, while there is nowhere to go. The
            chip's classes are unlayered, so the size rides on `style`. */}
        <span
          dir={dir}
          className="clay discover-chip discover-chip--new"
          style={{ "--clay-edge": "var(--accent-dark)", fontSize: "1.3rem", padding: "0.6rem 1.4rem" } as CSSProperties}
        >
          <Search className="h-5 w-5" strokeWidth={2.5} />
          {dict.activities.findCtaButton}
        </span>
        <span dir={dir} className="discover-soon">
          <span aria-hidden className="discover-soon-icon">
            <Hourglass className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />
          </span>
          {dict.activities.findSoon}
        </span>
      </div>
    </div>
  );
}
