import type { Metadata } from "next";
import { YoutubeCta } from "@/components/activities/youtube-cta";

export const metadata: Metadata = {
  title: "Activities — Edenic World",
  description: "Fun videos and hands-on activities for kids at Edenic World.",
};

/** First piece of the Activities page: the YouTube CTA card. No heading/intro
    copy — this section is cards only, by request. More activities land here
    later — this is stage one, not the finished page. */
export default function ActivitiesPage() {
  return (
    <main className="flex flex-1 flex-col px-4 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto w-full max-w-7xl">
        <YoutubeCta />
      </div>
    </main>
  );
}
