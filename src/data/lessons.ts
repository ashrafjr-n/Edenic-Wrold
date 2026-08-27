import type { CharacterId } from "@/types/character";
import type { Lesson } from "@/types/lesson";

export const lessonsByCharacter: Record<CharacterId, Lesson[]> = {
  pinki: [
    {
      id: "numbers",
      name: "Learn Numbers",
      description: "Learn numbers 1 to 10",
      image: "/assets/learn-with-pinki/123-pinki.png",
      theme: {
        accent: "var(--color-subject-numbers)",
        accentDark: "var(--color-subject-numbers-dark)",
      },
      totalItems: 10,
      locked: false,
    },
    {
      id: "letters",
      name: "Learn Letters",
      description: "Learn the alphabet from A to Z",
      image: "/assets/icons/A.png",
      theme: {
        accent: "var(--color-subject-letters)",
        accentDark: "var(--color-subject-letters-dark)",
      },
      totalItems: 26,
      locked: true,
    },
    {
      id: "colors",
      name: "Learn Colors",
      description: "Discover colors all around us",
      image: "/assets/icons/blue-ball.png",
      theme: {
        accent: "var(--color-subject-colors)",
        accentDark: "var(--color-subject-colors-dark)",
      },
      totalItems: 8,
      locked: true,
    },
    {
      id: "shapes",
      name: "Learn Shapes",
      description: "Explore circles, squares and more",
      /* A star, not the plain ball this used to use: the ball said nothing
         about shapes and clashed with Colors, which is a ball too. */
      image: "/assets/icons/yellow-star.png",
      theme: {
        accent: "var(--color-subject-shapes)",
        accentDark: "var(--color-subject-shapes-dark)",
      },
      totalItems: 8,
      locked: true,
    },
  ],
  nova: [],
  bloo: [],
};
