import Image from "next/image";
import { Puzzle } from "lucide-react";
import { Button3D } from "@/components/ui/button-3d";

const IMAGE_SRC = "/assets/activity-page/puzzle/puzzle-card.jpg";

/** Second card on the Activities page: the puzzle-pieces scene as a full-bleed
    background, a light green-to-blue wash over it (mixed from the site's own
    `--color-go`/`--brand` tokens, not a new hue) for legibility, and a green
    clay "Puzzle Time" button centred on top, leading into `/activities/puzzle`.

    Shorter than `YoutubeCta` on purpose: the image's own `16:9` shape is
    wider (so shorter, at the same card width) than the YouTube card's `3:2`
    frame, and this card has no separate button row below it — the button
    overlays the image instead. */
export function PuzzleCta({ className = "" }: { className?: string }) {
  return (
    <div className={`card relative aspect-[16/9] overflow-hidden ${className}`}>
      <Image
        src={IMAGE_SRC}
        alt="Colourful puzzle pieces scattered across the card"
        fill
        sizes="(min-width: 1024px) 80rem, 100vw"
        className="object-cover"
      />

      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(160deg, color-mix(in srgb, var(--color-go) 55%, transparent) 0%, color-mix(in srgb, var(--brand) 45%, transparent) 100%)",
        }}
      />

      <div className="absolute inset-0 flex items-center justify-center">
        <Button3D
          tone={{ face: "var(--color-go)", edge: "var(--color-go-dark)" }}
          href="/activities/puzzle"
          className="px-8 py-4 text-lg sm:px-10 sm:text-xl"
        >
          <Puzzle className="h-6 w-6" strokeWidth={2} />
          Puzzle Time
        </Button3D>
      </div>
    </div>
  );
}
