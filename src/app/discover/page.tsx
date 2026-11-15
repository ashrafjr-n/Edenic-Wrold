import type { Metadata } from "next";
import { PlayDoor } from "@/components/discover/play-door";
import { WatchDoor } from "@/components/discover/watch-door";
import { dirFor } from "@/lib/format-dict";
import { getDictionary } from "@/lib/locale";
import { watchStills } from "@/data/watch";

export const metadata: Metadata = {
  title: "Discover — Edenic World",
  description: "Play games or watch videos with Pinki, Nova and Bloo at Edenic World.",
};

const ITEM_DELAY = 0.1;
const ITEM_STAGGER = 0.12;

/**
 * Discover: two doors, Play and Watch, and nothing else — no heading, no copy
 * around them. Each card takes half the height that is left (and, from `sm`,
 * half the width), so the page is exactly one screen: no scroll on a phone and
 * no empty band under the cards. Play is "coming soon" for now (2026-11-15):
 * its door is not a link.
 */
export default async function DiscoverPage() {
  const dict = await getDictionary();
  const dir = dirFor(dict.locale);
  const words = dict.discover;

  return (
    <main className="flex flex-1 flex-col px-4 py-4 sm:px-8 sm:py-6">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 sm:flex-row sm:gap-6">
        <PlayDoor
          title={words.playButton}
          subtitle={words.playSub}
          soon={words.playSoon}
          dir={dir}
          className="anim-rise-in"
          style={{ animationDelay: `${ITEM_DELAY}s` }}
        />
        <WatchDoor
          stills={watchStills}
          alt={words.watchAlt}
          title={words.watchButton}
          subtitle={words.watchSub}
          badge={words.watchNew}
          dir={dir}
          className="anim-rise-in"
          style={{ animationDelay: `${ITEM_DELAY + ITEM_STAGGER}s` }}
        />
      </div>
    </main>
  );
}
