import type { CSSProperties } from "react";
import Image from "next/image";
import { Shuffle } from "lucide-react";
import { Button3D } from "@/components/ui/button-3d";
import type { Dictionary } from "@/lib/dictionaries/en";
import { dirFor } from "@/lib/format-dict";
import cupsCard from "../../../public/assets/play/cups/cups-card.jpg";

/** Third of the Activities page's game cards (2026-10-23 — Nova's cups,
    moved out of the Vegetables lessons on direct request), built to
    `PuzzleCta`'s and `MemoryMatchCta`'s recipe: full-bleed `16:9` picture
    (Nova's garden, her three cups, a carrot under the tipped one —
    `render.cjs backdrop play-cups` → `crop.py playcard cups`; static import,
    so a repaint busts the cache), a light wash over it, one clay button
    centred on top. **Nova's lavender leads** (`--color-nova` into
    `--brand`, two existing tokens as the recipe requires), white type —
    her character token does not move with the theme. */
export function CupsCta({
  dict,
  className = "",
  style,
}: {
  dict: Dictionary;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={`card relative aspect-[16/9] overflow-hidden ${className}`} style={style}>
      {/* `dir`: the `alt` names Nova in Latin inside a right-to-left
          sentence — see `lib/format-dict.ts`'s `dirFor`. */}
      <Image
        src={cupsCard}
        alt={dict.activities.cupsCtaAlt}
        dir={dirFor(dict.locale)}
        fill
        sizes="(min-width: 1024px) 24rem, 100vw"
        className="object-cover"
      />

      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(160deg, color-mix(in srgb, var(--color-nova) 55%, transparent) 0%, color-mix(in srgb, var(--brand) 45%, transparent) 100%)",
        }}
      />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <Button3D
          tone={{ face: "var(--color-nova)", edge: "var(--color-nova-dark)", text: "#fff" }}
          href="/play/cups"
          className="px-6 py-3.5 text-base sm:px-8 sm:py-4 sm:text-lg"
        >
          <Shuffle className="h-5 w-5" strokeWidth={2.25} />
          <span dir={dirFor(dict.locale)}>{dict.activities.cupsCtaButton}</span>
        </Button3D>
      </div>
    </div>
  );
}
