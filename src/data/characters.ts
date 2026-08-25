import type { Character } from "@/types/character";

export const characters: Character[] = [
  {
    id: "pinki",
    name: "Pinki",
    image: "/assets/friends/pinki.png",
    accent: "var(--color-pinki)",
    accentSoft: "var(--color-pinki-soft)",
    accentDark: "var(--color-pinki-dark)",
    locked: false,
  },
  {
    id: "nova",
    name: "Nova",
    image: "/assets/friends/nova.png",
    accent: "var(--color-nova)",
    accentSoft: "var(--color-nova-soft)",
    accentDark: "var(--color-nova-dark)",
    locked: true,
  },
  {
    id: "bloo",
    name: "Bloo",
    image: "/assets/friends/bloo.png",
    accent: "var(--color-bloo)",
    accentSoft: "var(--color-bloo-soft)",
    accentDark: "var(--color-bloo-dark)",
    locked: true,
  },
];
