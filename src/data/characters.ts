import type { Character } from "@/types/character";

/** Taglines are translated content — see `dict.characters` in the
    dictionaries, not this file. */
export const characters: Character[] = [
  {
    id: "pinki",
    name: "Pinki",
    image: "/assets/friends/pinki.png",
    accent: "var(--color-pinki)",
    accentDark: "var(--color-pinki-dark)",
    locked: false,
  },
  {
    id: "nova",
    name: "Nova",
    image: "/assets/friends/nova.png",
    accent: "var(--color-nova)",
    accentDark: "var(--color-nova-dark)",
    locked: false,
    button: {
      face: "var(--color-gold)",
      edge: "var(--color-gold-dark)",
      text: "var(--color-ink-fixed)",
    },
  },
  {
    id: "bloo",
    name: "Bloo",
    image: "/assets/friends/bloo.png",
    accent: "var(--color-bloo)",
    accentDark: "var(--color-bloo-dark)",
    locked: false,
  },
];
