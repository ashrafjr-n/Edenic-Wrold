import type { CSSProperties } from "react";
import Image from "next/image";
import { Hourglass } from "lucide-react";
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
        <span dir={dir} className="text-3xl font-bold text-white drop-shadow-[0_2px_6px_rgb(0_0_0/25%)] sm:text-4xl">
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
