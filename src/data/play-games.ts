import type { StaticImageData } from "next/image";
import findCard from "../../public/assets/play/find/find-card.jpg";
import memoryCard from "../../public/assets/play/memory-match/memory-match.jpg";
import puzzleCard from "../../public/assets/play/puzzle/puzzle-card.jpg";

export type PlayCardId = "puzzle" | "memory" | "find";

/** One of `/play`'s game cards (`GameCard`): its picture, where it goes and its clay — face, edge, and the ink its name wears on
    that face (gold is too pale for white). */
export interface PlayCard {
  art: StaticImageData;
  href: string;
  face: string;
  edge: string;
  ink: string;
}

export const PLAY_CARDS: Record<PlayCardId, PlayCard> = {
  puzzle: { art: puzzleCard, href: "/play/puzzle", face: "var(--color-go)", edge: "var(--color-go-dark)", ink: "#fff" },
  memory: {
    art: memoryCard,
    href: "/play/memory-match",
    face: "var(--color-gold)",
    edge: "var(--color-gold-dark)",
    ink: "var(--color-ink-fixed)",
  },
  find: { art: findCard, href: "/play/find", face: "var(--accent)", edge: "var(--accent-dark)", ink: "#fff" },
};
