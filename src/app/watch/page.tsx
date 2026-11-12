import type { Metadata } from "next";
import { BackRow } from "@/components/ui/back-button";
import { WatchGrid } from "@/components/watch/watch-grid";
import { watchClips, watchEpisodes } from "@/data/watch";
import { dirFor } from "@/lib/format-dict";
import { getDictionary } from "@/lib/locale";

export const metadata: Metadata = {
  title: "Watch — Edenic World",
  description: "Watch the Edenic World videos with Pinki, Nova and Bloo.",
};

export default async function WatchPage() {
  const dict = await getDictionary();
  return (
    <main className="flex flex-1 flex-col overflow-x-clip">
      <BackRow href="/discover" label={dict.discover.backToDiscover} />
      <div className="px-4 pb-10 pt-6 sm:px-8">
        <h1 className="sr-only">{dict.discover.watchButton}</h1>
        <WatchGrid
          episodes={watchEpisodes}
          {...watchClips(dict)}
          words={{
            episodesTitle: dict.discover.episodesTitle,
            reelsTitle: dict.discover.reelsTitle,
            filterAll: dict.discover.filterAll,
            filterAria: dict.discover.filterAria,
            clipAria: dict.discover.watchClipAria,
            episodeAria: dict.discover.episodeAria,
            close: dict.lessonPlayer.close,
          }}
          dir={dirFor(dict.locale)}
        />
      </div>
    </main>
  );
}
