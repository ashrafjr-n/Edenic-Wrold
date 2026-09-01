import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { YoutubeCta } from "@/components/activities/youtube-cta";
import { PuzzleCta } from "@/components/activities/puzzle-cta";

type ClayVars = CSSProperties & { "--clay-edge"?: string };

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

            It is a `.clay` bar, not a border: brand blue with the site's
            grain over it, an inner highlight and shade, and its own soft
            shadow — the same material as every button and panel here. A
            hairline rule would have been the one hard edge on the site, and a
            faded gradient one (tried first) carried no grain at all, since
            the overlay blend has nothing to push against below full strength.
            `.clay` sets no radius of its own, so `rounded-full` composes with
            it safely — unlike `.card`/`.tile`, which would swallow it. */}
        <div
          aria-hidden
          className="clay mx-auto h-1.5 w-full max-w-3xl rounded-full"
          style={
            {
              backgroundColor: "var(--brand)",
              "--clay-edge": "var(--brand-dark)",
            } as ClayVars
          }
        />

        <PuzzleCta />
      </div>
    </main>
  );
}
