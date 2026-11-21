import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { PlayLock } from "@/components/activities/play-lock";
import { PlayStars } from "@/components/activities/play-stars";
import { Cloud } from "@/components/ui/cloud";
import { PLAY_CARDS } from "@/data/play-games";
import { dirFor } from "@/lib/format-dict";
import { getDictionary } from "@/lib/locale";
import bloo from "../../../public/assets/friends/bloo.png";

export const metadata: Metadata = {
  title: "Play — Edenic World",
  description: "Puzzles, memory games and more with Pinki, Nova and Bloo at Edenic World.",
};

const ITEM_DELAY = 0.1;
const ITEM_STAGGER = 0.12;

/**
 * Play = three games, cards only, no heading or copy (the user, 2026-11-19):
 * Puzzle, Memory Match and Find. Every card is a `GameCard`; each opens for
 * two of the stars a child earns in Learn (`PlayLock`). It is a top-level tab
 * (2026-11-21), so no back button: the cards sit on Bloo's sky — one big clay
 * stage (`.play-stage`) with clouds, Bloo standing on the cards' top edge and
 * the bank of stars left in the corner (`PlayStars`). The Sleeping Lab is paused.
 *
 * Phone: one column. Tablet: two, Find centred under them. Desktop: three in
 * a row. The stage and the cards rise in, staggered (`anim-rise-in`).
 */
export default async function PlayPage() {
  const dict = await getDictionary();
  const dir = dirFor(dict.locale);
  const words = dict.activities;
  const delay = (i: number) => ({ animationDelay: `${ITEM_DELAY + i * ITEM_STAGGER}s` });

  return (
    <main className="flex flex-1 flex-col overflow-x-clip">
      <h1 className="sr-only">{dict.nav.play}</h1>
      <div className="flex flex-1 flex-col justify-center px-4 pb-10 pt-6 sm:px-8 sm:pb-14 sm:pt-8">
        <section className="play-stage clay anim-rise-in mx-auto w-full max-w-7xl">
          <Cloud size="sm" variant={2} className="absolute end-[14%] top-[5%] -z-10 opacity-90" style={{ "--cloud-w": "4.4rem" } as CSSProperties} />
          <Cloud size="sm" variant={3} className="absolute start-[38%] top-[9%] -z-10 opacity-75 max-sm:hidden" style={{ "--cloud-w": "3.2rem" } as CSSProperties} />
          <Cloud size="sm" variant={1} className="absolute -start-6 bottom-[8%] -z-10 opacity-60 max-sm:hidden" style={{ "--cloud-w": "5rem" } as CSSProperties} />

          <div className="play-stage-top">
            <Image src={bloo} alt="" sizes="(min-width: 1024px) 10rem, 8rem" className="play-stage-bloo" />
            <span className="ms-auto">
              <PlayStars label={words.starsLeftAria} />
            </span>
          </div>

          <div className="relative z-[1] grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
            <PlayLock game="puzzle" card={PLAY_CARDS.puzzle} title={words.puzzleTitle} alt={words.puzzleCtaAlt}
              words={words} dir={dir} className="anim-rise-in" style={delay(1)} />
            <PlayLock game="memory" card={PLAY_CARDS.memory} title={words.memoryTitle} alt={words.memoryCtaAlt}
              words={words} dir={dir} className="anim-rise-in" style={delay(2)} />
            <PlayLock game="find" card={PLAY_CARDS.find} title={words.findCtaButton} alt={words.findCtaAlt}
              words={words} dir={dir}
              className="anim-rise-in sm:col-span-2 sm:w-[calc(50%-0.75rem)] sm:justify-self-center lg:col-span-1 lg:w-auto lg:justify-self-stretch"
              style={delay(3)} />
          </div>
        </section>
      </div>
    </main>
  );
}
