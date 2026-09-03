import Image from "next/image";
import { Brain } from "lucide-react";
import { Button3D } from "@/components/ui/button-3d";
import memoryCard from "../../../public/assets/activity-page/memory-match/memory-match.jpg";

/** The art is a **static import**, not a `/public` path: a static import is
    content-hashed into its URL, so replacing the file on disk changes the URL
    and every cache misses. A plain public path keeps the same URL forever,
    which is exactly why a repainted card appeared not to update (same trap
    `ui/logo.tsx` documents).

    Second of the Activities page's two cards, built to `PuzzleCta`'s recipe —
    full-bleed `16:9` picture, a light wash over it for legibility, one clay
    button centred on top — with **gold leading instead of green**. The wash
    is the same `color-mix` of two existing tokens (`--color-gold` into
    `--brand`), never a new hue, so the two cards read as a pair with only the
    hero colour swapped.

    The button's text and icon are `--color-ink`, not the usual white: gold is
    the one face on the site pale enough that white type disappears on it —
    the same call the puzzle stage's hint chip makes for its lightbulb.

    Live now that the twelve levels exist; it was presentation-only with no
    `href` for one round before that, exactly as `PuzzleCta` was. Its
    `ActivityCountBadge` ("0 / 12") was cut on direct request along with the
    puzzle card's. */
export function MemoryMatchCta({ className = "" }: { className?: string }) {
  return (
    <div className={`card relative aspect-[16/9] overflow-hidden ${className}`}>
      <Image
        src={memoryCard}
        alt="Pinki, Nova and Bloo playing a memory card game"
        fill
        sizes="(min-width: 1024px) 32rem, 100vw"
        className="object-cover"
      />

      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(160deg, color-mix(in srgb, var(--color-gold) 55%, transparent) 0%, color-mix(in srgb, var(--brand) 45%, transparent) 100%)",
        }}
      />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <Button3D
          tone={{
            face: "var(--color-gold)",
            edge: "var(--color-gold-dark)",
            text: "var(--color-ink)",
          }}
          href="/activities/memory-match"
          className="px-6 py-3.5 text-base sm:px-8 sm:py-4 sm:text-lg"
        >
          <Brain className="h-5 w-5" strokeWidth={2} />
          Memory Match
        </Button3D>
      </div>
    </div>
  );
}
