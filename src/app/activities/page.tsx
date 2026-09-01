import type { Metadata } from "next";
import { YoutubeCta } from "@/components/activities/youtube-cta";
import { PuzzleCta } from "@/components/activities/puzzle-cta";

export const metadata: Metadata = {
  title: "Activities — Edenic World",
  description: "Fun videos and hands-on activities for kids at Edenic World.",
};

/** The Activities page: cards only, no heading/intro copy, by request. More
    cards land here later — this is still being built out. */
export default function ActivitiesPage() {
  return (
    <main className="flex flex-1 flex-col px-4 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 sm:gap-8">
        <YoutubeCta />

        {/* The channel above, the things to play below — and more play cards
            are coming under this, which is what the rule is really marking:
            the end of one section, not a gap between two cards.

            It fades out at both ends rather than stopping: nothing on this
            site has a hard edge, and a full-strength line ruled across the
            page would be the only one. Brand blue at a quarter strength, so
            it reads as part of the page rather than as a border — and no new
            hue, the same rule every other surface here follows. */}
        <div
          aria-hidden
          className="mx-auto h-0.5 w-full max-w-3xl rounded-full"
          style={{
            backgroundImage:
              "linear-gradient(90deg, transparent, color-mix(in srgb, var(--brand) 30%, transparent), transparent)",
          }}
        />

        <PuzzleCta />
      </div>
    </main>
  );
}
