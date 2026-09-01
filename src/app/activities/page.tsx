import type { Metadata } from "next";
import { YoutubeCta } from "@/components/activities/youtube-cta";

export const metadata: Metadata = {
  title: "Activities — Edenic World",
  description: "Fun videos and hands-on activities for kids at Edenic World.",
};

/** First piece of the Activities page: the YouTube CTA card. More activities
    land here later — this is stage one, not the finished page. */
export default function ActivitiesPage() {
  return (
    <main className="flex flex-1 flex-col px-4 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto w-full max-w-7xl">
        <h1 className="text-4xl font-bold tracking-tight text-[var(--color-ink)] sm:text-5xl">
          Activities
        </h1>
        <p className="mt-3 max-w-xl text-lg text-[var(--color-ink)]/60">
          Fun things to watch and do with Pinki, Nova and Bloo.
        </p>

        <YoutubeCta className="mt-8 sm:mt-10" />
      </div>
    </main>
  );
}
