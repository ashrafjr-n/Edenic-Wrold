import Image from "next/image";
import { Puzzle } from "lucide-react";
import { puzzleStages } from "@/data/puzzles";
import { puzzleKey } from "@/store/progress";
import { Button3D } from "@/components/ui/button-3d";
import { ActivityCountBadge } from "./activity-count-badge";
import puzzleCard from "../../../public/assets/activity-page/puzzle/puzzle-card.jpg";

const STAGE_KEYS = puzzleStages.map((stage) => puzzleKey(stage.value));

/** The art is a **static import**, not a `/public` path: a static import is
    content-hashed into its URL, so replacing the file on disk changes the URL
    and every cache misses. A plain public path keeps the same URL forever,
    which is exactly why a repainted card appeared not to update (same trap
    `ui/logo.tsx` documents).

    Second card on the Activities page: the puzzle-pieces scene as a full-bleed
    background, a light green-to-blue wash over it (mixed from the site's own
    `--color-go`/`--brand` tokens, not a new hue) for legibility, and a green
    clay "Puzzle Time" button centred on top, leading into `/activities/puzzle`.

    Full-bleed at `16:9`, with the button over the picture rather than in a
    row beneath it. */
export function PuzzleCta({ className = "" }: { className?: string }) {
  return (
    <div className={`card relative aspect-[16/9] overflow-hidden ${className}`}>
      {/* How many stages are done, so the choosing page carries the same
          sense of progress the stage grid does. */}
      <ActivityCountBadge
        keys={STAGE_KEYS}
        noun="puzzles"
        tint="var(--color-go-dark)"
      />

      <Image
        src={puzzleCard}
        alt="Colourful puzzle pieces scattered across the card"
        fill
        sizes="(min-width: 1024px) 27rem, 100vw"
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

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <Button3D
          tone={{ face: "var(--color-go)", edge: "var(--color-go-dark)" }}
          href="/activities/puzzle"
          className="px-6 py-3.5 text-base sm:px-8 sm:py-4 sm:text-lg"
        >
          <Puzzle className="h-5 w-5" strokeWidth={2} />
          Puzzle Time
        </Button3D>
      </div>
    </div>
  );
}
