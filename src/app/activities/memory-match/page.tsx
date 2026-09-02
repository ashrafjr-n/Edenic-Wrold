import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Image from "next/image";
import { ArrowLeft, Star } from "lucide-react";
import { memoryLevels } from "@/data/memory-levels";
import { Button3D } from "@/components/ui/button-3d";
import { MemoryGrid } from "@/components/activities/memory/memory-grid";

export const metadata: Metadata = {
  title: "Memory Match — Edenic World",
  description: "Twelve levels of matching pairs with Pinki, Nova and Bloo.",
};

type ClayVars = CSSProperties & { "--clay-edge"?: string };

export default function MemoryMatchPage() {
  return (
    <main className="relative flex flex-1 flex-col pb-16 pt-5 sm:pb-20">
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-8">
        {/* Back on the left, the heading's own mark centred on the page —
            centred on the page itself rather than on the space left over,
            which is why the back button is taken out of the flow. */}
        <div
          className="anim-drop-in relative flex items-center justify-center"
          style={{ animationDelay: "0.1s" }}
        >
          {/* The wrapper carries the positioning, not the button: `.btn3d`
              sets `position: relative` and is UNLAYERED, so a Tailwind
              `absolute` utility on the button itself silently loses and it
              stays in the centred flex row. */}
          <span className="absolute left-0 top-0">
            <Button3D
              tone={{ face: "var(--accent)", edge: "var(--accent-dark)" }}
              href="/activities"
              aria-label="Back to Activities"
              className="h-12 w-12 shrink-0 sm:h-14 sm:w-14"
            >
              <ArrowLeft
                className="h-5 w-5 text-white sm:h-6 sm:w-6"
                strokeWidth={2.75}
              />
            </Button3D>
          </span>

          {/* Three cards leaning together — two face down in gold, one turned
              over with a friend on it. The heading of this page is the game
              itself in miniature, the same call the puzzle page's three chips
              make, and it uses the real card backs so the picture and the
              board agree. */}
          <span className="flex items-center -space-x-2 sm:-space-x-2.5">
            <span
              aria-hidden
              className="clay anim-pop-in flex h-11 w-11 items-center justify-center rounded-2xl sm:h-12 sm:w-12"
              style={{
                backgroundColor: "var(--color-gold)",
                "--clay-edge": "var(--color-gold-dark)",
                rotate: "-12deg",
                animationDelay: "0.15s",
              } as ClayVars}
            >
              <Star
                className="h-1/2 w-1/2 fill-current"
                style={{ color: "color-mix(in srgb, var(--color-gold-dark) 55%, #fff)" }}
                strokeWidth={2}
              />
            </span>

            <span
              aria-hidden
              className="clay anim-pop-in relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl p-1.5 sm:h-16 sm:w-16"
              style={{
                backgroundColor: "var(--surface)",
                "--clay-edge": "var(--color-gold-dark)",
                rotate: "6deg",
                animationDelay: "0.23s",
              } as ClayVars}
            >
              <Image
                src="/assets/friends/pinki.png"
                alt=""
                width={140}
                height={140}
                className="h-full w-full object-contain"
              />
            </span>

            <span
              aria-hidden
              className="clay anim-pop-in flex h-11 w-11 items-center justify-center rounded-2xl sm:h-12 sm:w-12"
              style={{
                backgroundColor: "var(--color-gold)",
                "--clay-edge": "var(--color-gold-dark)",
                rotate: "14deg",
                animationDelay: "0.31s",
              } as ClayVars}
            >
              <Star
                className="h-1/2 w-1/2 fill-current"
                style={{ color: "color-mix(in srgb, var(--color-gold-dark) 55%, #fff)" }}
                strokeWidth={2}
              />
            </span>
          </span>
        </div>

        <div
          className="anim-fade-up mt-4 text-center sm:mt-5"
          style={{ animationDelay: "0.25s" }}
        >
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-ink)] sm:text-3xl">
            Memory Match
          </h1>
          <p className="mt-1 text-base text-[var(--color-ink)]/60 sm:text-lg">
            Find the matching friends!
          </p>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 py-8 sm:px-8 sm:py-10">
        <MemoryGrid levels={memoryLevels} />
      </div>
    </main>
  );
}
