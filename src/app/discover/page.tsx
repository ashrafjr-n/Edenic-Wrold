import type { Metadata } from "next";
import { PlayDoor } from "@/components/discover/play-door";
import { WatchDoor } from "@/components/discover/watch-door";
import { dirFor } from "@/lib/format-dict";
import { getDictionary } from "@/lib/locale";
import { PLAY_CARDS } from "@/data/play-games";
import { watchStills } from "@/data/watch";

export const metadata: Metadata = {
  title: "Discover — Edenic World",
  description: "Play games or watch videos with Pinki, Nova and Bloo at Edenic World.",
};

const ITEM_DELAY = 0.1;
const ITEM_STAGGER = 0.12;

/**
 * Discover: two doors, Watch and Play, and nothing else — no heading, no copy
 * around them. A pair of clay panels on one recipe (name, a picture of what
 * is inside, a white sign): Watch in pink with its TV, Play in sky blue with
 * its three games. A phone and a tablet stack them, half the height left each; from
 * `lg` they sit side by side, Watch the wider. The page is exactly one screen.
 */
export default async function DiscoverPage() {
  const dict = await getDictionary();
  const dir = dirFor(dict.locale);
  const words = dict.discover;

  return (
    <main className="flex flex-1 flex-col px-4 py-4 sm:px-8 sm:py-6">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 sm:gap-6 lg:flex-row">
        <WatchDoor
          still={watchStills[0]}
          alt={words.watchAlt}
          title={words.watchButton}
          subtitle={words.watchSub}
          badge={words.watchNew}
          go={words.watchNow}
          dir={dir}
          className="anim-rise-in"
          style={{ animationDelay: `${ITEM_DELAY}s` }}
        />
        <PlayDoor
          games={[PLAY_CARDS.puzzle.art, PLAY_CARDS.memory.art, PLAY_CARDS.find.art]}
          title={words.playButton}
          subtitle={words.playSub}
          go={words.playGo}
          dir={dir}
          className="anim-rise-in"
          style={{ animationDelay: `${ITEM_DELAY + ITEM_STAGGER}s` }}
        />
      </div>
    </main>
  );
}
