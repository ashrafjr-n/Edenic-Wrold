import type { CharacterId } from "@/types/character";
import type { Lesson } from "@/types/lesson";

export const lessonsByCharacter: Record<CharacterId, Lesson[]> = {
  pinki: [
    {
      id: "numbers",
      name: "Learn Numbers",
      description: "Learn numbers 1 to 9",
      image: "/assets/learn-with-pinki/pinki-numbers.png",
      theme: {
        accent: "var(--color-subject-numbers)",
        accentDark: "var(--color-subject-numbers-dark)",
      },
      totalItems: 9,
      locked: false,
    },
    {
      id: "letters",
      name: "Learn Letters",
      description: "Learn the alphabet from A to Z",
      image: "/assets/learn-with-pinki/pinki-letters.png",
      theme: {
        accent: "var(--color-subject-letters)",
        accentDark: "var(--color-subject-letters-dark)",
      },
      totalItems: 30,
      locked: true,
    },
    {
      id: "colors",
      name: "Learn Colors",
      description: "Discover colors all around us",
      image: "/assets/learn-with-pinki/pinki-colors.png",
      theme: {
        accent: "var(--color-subject-colors)",
        accentDark: "var(--color-subject-colors-dark)",
      },
      totalItems: 10,
      locked: true,
    },
  ],
  nova: [],
  bloo: [],
};
