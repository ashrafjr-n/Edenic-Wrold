import type { CharacterId } from "@/types/character";
import type { Lesson } from "@/types/lesson";

/** `name`/`description` are translated content — see `dict.lessons` in the
    dictionaries, not this file. */
export const lessonsByCharacter: Record<CharacterId, Lesson[]> = {
  pinki: [
    {
      id: "numbers",
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
