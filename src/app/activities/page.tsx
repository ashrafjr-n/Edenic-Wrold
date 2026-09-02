import type { Metadata } from "next";
import { MascotYoutubeCta } from "@/components/activities/mascot-youtube-cta";
import { PuzzleCta } from "@/components/activities/puzzle-cta";

export const metadata: Metadata = {
  title: "Activities — Edenic World",
  description: "Fun videos and hands-on activities for kids at Edenic World.",
};

/** The Activities page: cards only, no heading/intro copy, by request. More
    cards land here later — this is still being built out.

    `MascotYoutubeCta` replaced the full-width `YoutubeCta` banner that used
    to open this page — it's a fixed floating widget, not a card in this
    flow, which is why it renders outside the flex column below. */
export default function ActivitiesPage() {
  return (
    <main className="flex flex-1 flex-col px-4 py-10 sm:px-8 sm:py-14">
      <MascotYoutubeCta />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 sm:gap-8">
        <PuzzleCta />
      </div>
    </main>
  );
}
