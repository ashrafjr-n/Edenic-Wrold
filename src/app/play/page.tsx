import type { Metadata } from "next";
import { Hourglass } from "lucide-react";
import { GameCard } from "@/components/activities/game-card";
import { PlayLock } from "@/components/activities/play-lock";
import { PlayStars } from "@/components/activities/play-stars";
import { BackRow } from "@/components/ui/back-button";
import { PLAY_CARDS } from "@/data/play-games";
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
 * Every card is a `GameCard`; Puzzle and Memory Match each open for two of
 * the stars a child earns in Learn (`PlayLock`); the bank of stars left sits
 * at the right of the back row (`PlayStars`). The Sleeping Lab is paused.
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
          <PlayLock game="puzzle" card={PLAY_CARDS.puzzle} title={words.puzzleTitle} alt={words.puzzleCtaAlt}
            words={words} dir={dir} className="anim-rise-in" style={delay(0)} />
          <PlayLock game="memory" card={PLAY_CARDS.memory} title={words.memoryTitle} alt={words.memoryCtaAlt}
            words={words} dir={dir} className="anim-rise-in" style={delay(1)} />
          <GameCard
            card={PLAY_CARDS.find}
            title={words.findCtaButton}
            alt={words.findCtaAlt}
            dir={dir}
            label={`${words.findCtaButton} — ${words.findSoon}`}
            action={
              <span dir={dir} className="discover-soon discover-soon--sm">
                <span aria-hidden className="discover-soon-icon">
                  <Hourglass className="h-4 w-4" strokeWidth={2.5} />
                </span>
                {words.findSoon}
              </span>
            }
            className="anim-rise-in sm:col-span-2 sm:w-[calc(50%-1rem)] sm:justify-self-center lg:col-span-1 lg:w-auto lg:justify-self-stretch"
            style={delay(2)}
          />
        </div>
      </div>
    </main>
  );
}
