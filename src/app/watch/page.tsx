import type { Metadata } from "next";
import { Footer } from "@/components/layout/footer";
import { WatchGrid } from "@/components/watch/watch-grid";
import { watchClips, watchEpisodes, watchSongs } from "@/data/watch";
import { dirFor } from "@/lib/format-dict";
import { getDictionary } from "@/lib/locale";

export const metadata: Metadata = {
  title: "Watch — Edenic World",
  description: "Watch the Edenic World videos with Pinki, Nova and Bloo.",
};

export default async function WatchPage() {
  const dict = await getDictionary();
  return (
    <>
      <main className="flex flex-1 flex-col overflow-x-clip">
        <div className="px-4 pb-10 pt-6 sm:px-8 sm:pt-8">
          <h1 className="sr-only">{dict.discover.watchButton}</h1>
          <WatchGrid
            episodes={watchEpisodes}
            songs={watchSongs}
            {...watchClips(dict)}
            words={{
              episodesTitle: dict.discover.episodesTitle,
              reelsTitle: dict.discover.reelsTitle,
              songsTitle: dict.discover.songsTitle,
              songAria: dict.discover.songAria,
              filterAll: dict.discover.filterAll,
              filterAria: dict.discover.filterAria,
              clipAria: dict.discover.watchClipAria,
              episodeAria: dict.discover.episodeAria,
              latestEpisode: dict.discover.latestEpisode,
              watchNow: dict.discover.watchNow,
              more: dict.discover.more,
              close: dict.lessonPlayer.close,
              showEpisode: dict.discover.showEpisode,
            }}
            dir={dirFor(dict.locale)}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
