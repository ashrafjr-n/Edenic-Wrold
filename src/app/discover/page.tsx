import type { Metadata } from "next";
import { Gamepad2, Play } from "lucide-react";
import { DiscoverCard } from "@/components/discover/discover-card";
import { dirFor } from "@/lib/format-dict";
import { getDictionary } from "@/lib/locale";
import memoryCard from "../../../public/assets/play/memory-match/memory-match.jpg";
import watchCard from "../../../public/hero.webp";

export const metadata: Metadata = {
  title: "Discover — Edenic World",
  description: "Play games or watch videos with Pinki, Nova and Bloo at Edenic World.",
};

const ITEM_DELAY = 0.1;
const ITEM_STAGGER = 0.12;

/**
 * Discover: two doors, Play and Watch, and nothing else — no heading, no
 * copy, like `/play`. Each card takes half the height that is left (and, from
 * `sm`, half the width), so the page is exactly one screen: no scroll on a
 * phone and no empty band under the cards.
 */
export default async function DiscoverPage() {
  const dict = await getDictionary();
  const dir = dirFor(dict.locale);
  const words = dict.discover;

  return (
    <main className="flex flex-1 flex-col px-4 py-4 sm:px-8 sm:py-6">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 sm:flex-row sm:gap-6">
        <DiscoverCard
          art={memoryCard}
          alt={dict.activities.memoryCtaAlt}
          artPosition="42% 50%"
          wash={["var(--accent)", "var(--brand)"]}
          tone={{ face: "var(--accent)", edge: "var(--accent-dark)", text: "#fff" }}
          href="/play"
          label={words.playButton}
          icon={Gamepad2}
          dir={dir}
          className="anim-rise-in"
          style={{ animationDelay: `${ITEM_DELAY}s` }}
        />
        <DiscoverCard
          art={watchCard}
          alt={words.watchAlt}
          artPosition="50% 50%"
          wash={["var(--brand)", "var(--accent)"]}
          tone={{ face: "var(--brand)", edge: "var(--brand-dark)", text: "#fff" }}
          href="/watch"
          label={words.watchButton}
          icon={Play}
          dir={dir}
          className="anim-rise-in"
          style={{ animationDelay: `${ITEM_DELAY + ITEM_STAGGER}s` }}
        />
      </div>
    </main>
  );
}
