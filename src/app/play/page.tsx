import type { Metadata } from "next";
import { FindCta } from "@/components/activities/find-cta";
import { MemoryMatchCta } from "@/components/activities/memory-match-cta";
import { PlayLock } from "@/components/activities/play-lock";
import { PlayStars } from "@/components/activities/play-stars";
import { PuzzleCta } from "@/components/activities/puzzle-cta";
import { BackRow } from "@/components/ui/back-button";
import { dirFor } from "@/lib/format-dict";
import { getDictionary } from "@/lib/locale";

export const metadata: Metadata = {
  title: "Play — Edenic World",
  description: "Puzzles, memory games and more with Pinki, Nova and Bloo at Edenic World.",
};

const ITEM_DELAY = 0.1;
const ITEM_STAGGER = 0.12;

/**
 * Play = three games, cards only, no heading or copy (the user, 2026-11-19):
 * Puzzle, Memory Match and Find (not built yet — its card is not a link).
 * Puzzle and Memory Match each open for two of the stars a child earns in
 * Learn (`PlayLock`); the bank of stars left sits at the right of the back
 * row (`PlayStars`). The Sleeping Lab is paused.
 *
 * Phone: one column. Tablet: two, Find centred under them. Desktop: three in
 * a row. The cards rise in, staggered (`anim-rise-in`).
 */
export default async function PlayPage() {
  const dict = await getDictionary();
  const dir = dirFor(dict.locale);
  const words = dict.activities;
  const delay = (i: number) => ({ animationDelay: `${ITEM_DELAY + i * ITEM_STAGGER}s` });

  return (
    <main className="flex flex-1 flex-col overflow-x-clip">
      <BackRow href="/discover" label={dict.discover.backToDiscover}>
        <PlayStars label={words.starsLeftAria} />
      </BackRow>
      <h1 className="sr-only">{dict.discover.playButton}</h1>
      <div className="flex flex-1 flex-col justify-center px-4 pb-10 pt-6 sm:px-8 sm:pb-14">
        <div className="mx-auto grid w-full max-w-5xl gap-6 sm:grid-cols-2 sm:gap-8 lg:max-w-7xl lg:grid-cols-3">
          <PlayLock game="puzzle" name={words.puzzleTitle} words={words} dir={dir} className="anim-rise-in" style={delay(0)}>
            <PuzzleCta dict={dict} />
          </PlayLock>
          <PlayLock game="memory" name={words.memoryTitle} words={words} dir={dir} className="anim-rise-in" style={delay(1)}>
            <MemoryMatchCta dict={dict} />
          </PlayLock>
          <FindCta
            dict={dict}
            className="anim-rise-in sm:col-span-2 sm:w-[calc(50%-1rem)] sm:justify-self-center lg:col-span-1 lg:w-auto"
            style={delay(2)}
          />
        </div>
      </div>
    </main>
  );
}
